/**
 * get_projects_with_facets
 * 
 * Filters projects by search terms, IDs, statuses, and computed numeric ranges.
 * Returns a paginated list of projects with nested relations and computed metrics,
 * as well as faceted unique value lists for the requested columns.
 *
 * Implements "Independent Facet" logic:
 * - Available count for a facet is calculated by applying all filters EXCEPT the filter for that category.
 * - This allows multi-select within a category (OR logic) while filtering between categories (AND logic).
 * - Total count is the base count before any filters (but after visibility checks).
 */

-- Delete the function if it exists
DROP FUNCTION IF EXISTS get_projects_with_facets;

CREATE OR REPLACE FUNCTION get_projects_with_facets(
  p_search TEXT DEFAULT NULL,
  p_address_search TEXT DEFAULT NULL,
  p_company_ids UUID[] DEFAULT NULL,
  p_lender_ids UUID[] DEFAULT NULL,
  p_statuses TEXT[] DEFAULT NULL,
  p_user_org_ids UUID[] DEFAULT NULL,
  p_is_internal BOOLEAN DEFAULT FALSE,
  p_facet_columns TEXT[] DEFAULT NULL,
  -- Computed Field Filters
  p_investor_capital_min NUMERIC DEFAULT NULL,
  p_investor_capital_max NUMERIC DEFAULT NULL,
  p_equity_min NUMERIC DEFAULT NULL,
  p_equity_max NUMERIC DEFAULT NULL,
  p_leverage_min NUMERIC DEFAULT NULL,
  p_leverage_max NUMERIC DEFAULT NULL,
  -- Base Range Filters
  p_arv_min NUMERIC DEFAULT NULL,
  p_arv_max NUMERIC DEFAULT NULL,
  p_mortgage_min NUMERIC DEFAULT NULL,
  p_mortgage_max NUMERIC DEFAULT NULL,
  p_purchase_price_min NUMERIC DEFAULT NULL,
  p_purchase_price_max NUMERIC DEFAULT NULL,
  p_rehab_budget_min NUMERIC DEFAULT NULL,
  p_rehab_budget_max NUMERIC DEFAULT NULL,
  -- Pagination
  p_limit INT DEFAULT 10,
  p_offset INT DEFAULT 0,
  -- Compound sort: [{"column":"<key>","direction":"asc|desc"}, ...]
  p_sort_specs JSONB DEFAULT '[{"column":"created_at","direction":"desc"}]'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_results JSONB;
  v_total INT;
  v_facets JSONB := '{}'::jsonb;
  v_summary JSONB;
  v_sort_specs JSONB := COALESCE(NULLIF(p_sort_specs::text, 'null'), '[{"column":"created_at","direction":"desc"}]')::jsonb;
  v_order_parts TEXT[] := ARRAY[]::TEXT[];
  v_order_clause TEXT := 'created_at DESC NULLS LAST';
  v_spec JSONB;
  v_col TEXT;
  v_dir TEXT;
  v_expr TEXT;
  v_idx INT;
BEGIN
  -- Build ORDER BY from p_sort_specs (whitelist only)
  IF jsonb_array_length(v_sort_specs) > 0 THEN
    v_order_parts := ARRAY[]::TEXT[];
    FOR v_idx IN 0 .. (jsonb_array_length(v_sort_specs) - 1) LOOP
      v_spec := v_sort_specs->v_idx;
      v_col := LOWER(TRIM(COALESCE(v_spec->>'column', '')));
      v_dir := LOWER(TRIM(COALESCE(v_spec->>'direction', 'asc')));
      IF v_dir NOT IN ('asc', 'desc') THEN
        v_dir := 'asc';
      END IF;
      v_expr := CASE v_col
        WHEN 'address' THEN 'address'
        WHEN 'owner' THEN '(company->>''name'')'
        WHEN 'company' THEN '(company->>''name'')'
        WHEN 'lender' THEN '(lender_org->>''name'')'
        WHEN 'arv' THEN 'after_repair_value'
        WHEN 'after_repair_value' THEN 'after_repair_value'
        WHEN 'mortgage' THEN 'mortgage_amount'
        WHEN 'mortgage_amount' THEN 'mortgage_amount'
        WHEN 'equity' THEN 'equity'
        WHEN 'investor_capital' THEN 'investor_capital'
        WHEN 'investortotalequity' THEN 'investor_capital'
        WHEN 'leverage_percentage' THEN 'leverage_percentage'
        WHEN 'leveragepercentage' THEN 'leverage_percentage'
        WHEN 'status' THEN 'status'
        WHEN 'created_at' THEN 'created_at'
        WHEN 'purchase_price' THEN 'purchase_price'
        WHEN 'rehab_budget' THEN 'rehab_budget'
        WHEN 'total_cost' THEN 'total_cost'
        ELSE NULL
      END;
      IF v_expr IS NOT NULL THEN
        v_order_parts := v_order_parts || (v_expr || ' ' || v_dir || ' NULLS LAST');
      END IF;
    END LOOP;
    IF array_length(v_order_parts, 1) > 0 THEN
      v_order_clause := array_to_string(v_order_parts, ', ');
    END IF;
  END IF;

  -- 1. Create a base table with all metrics and visibility applied
  CREATE TEMP TABLE base_projects_with_metrics ON COMMIT DROP AS
  WITH metrics AS (
    SELECT 
      p.*,
      COALESCE(p.purchase_price, 0) + COALESCE(p.rehab_budget, 0) as total_cost,
      COALESCE(agg.investor_capital, 0) as investor_capital,
      COALESCE(agg.investor_current_value, 0) as investor_current_value,
      COALESCE(p.after_repair_value, 0) - (COALESCE(p.mortgage_amount, 0) + COALESCE(agg.investor_current_value, 0)) as equity,
      CASE 
        WHEN COALESCE(p.after_repair_value, 0) > 0 
        THEN (COALESCE(p.mortgage_amount, 0) + COALESCE(agg.investor_current_value, 0)) / p.after_repair_value
        ELSE 0 
      END as leverage_percentage,
      jsonb_build_object('id', c.id, 'name', c.name) as company_json,
      CASE WHEN l.id IS NOT NULL THEN jsonb_build_object('id', l.id, 'name', l.name) ELSE NULL END as lender_org_json,
      CASE WHEN tc.id IS NOT NULL THEN jsonb_build_object('id', tc.id, 'name', tc.name) ELSE NULL END as title_company_json
    FROM projects p
    LEFT JOIN companies c ON p.company_id = c.id
    LEFT JOIN orgs l ON p.lender_org_id = l.id
    LEFT JOIN title_companies tc ON p.title_company_id = tc.id
    LEFT JOIN LATERAL (
      SELECT 
        SUM(a.allocation_amount) as investor_capital,
        SUM(
          a.allocation_amount + 
          COALESCE(
            ((a.interest_rate_percentage / 100.0) * a.allocation_amount * 
            ((
              CASE 
                WHEN a.status = 'inactive' AND a.inactive_date IS NOT NULL THEN a.inactive_date 
                ELSE CURRENT_DATE 
              END - a.investment_date
            ) / 365.0)), 0) - COALESCE(a.distributed_to_date, 0)
        ) as investor_current_value
      FROM allocations a
      WHERE a.project_id = p.id
    ) agg ON TRUE
  )
  SELECT * FROM metrics
  WHERE 
    (p_is_internal OR p_user_org_ids IS NULL OR (
      lender_org_id = ANY(p_user_org_ids) OR
      realtor_org_id = ANY(p_user_org_ids) OR
      contractor_org_id = ANY(p_user_org_ids) OR
      EXISTS (SELECT 1 FROM allocations a WHERE a.project_id = metrics.id AND a.investor_org_id = ANY(p_user_org_ids))
    ));

  -- 2. Calculate filter flags for each row
  CREATE TEMP TABLE row_filter_flags ON COMMIT DROP AS
  SELECT 
    *,
    -- Search flags
    (p_search IS NULL OR (address ILIKE '%' || p_search || '%' OR (company_json->>'name') ILIKE '%' || p_search || '%' OR (lender_org_json->>'name') ILIKE '%' || p_search || '%')) as f_global_search,
    (p_address_search IS NULL OR address ILIKE '%' || p_address_search || '%') as f_address_search,
    -- Facet flags
    (p_company_ids IS NULL OR company_id = ANY(p_company_ids)) as f_company,
    (p_lender_ids IS NULL OR lender_org_id = ANY(p_lender_ids)) as f_lender,
    (p_statuses IS NULL OR cardinality(p_statuses) = 0 OR LOWER(status) IN (SELECT LOWER(s) FROM unnest(p_statuses) AS s)) as f_status,
    -- Range flags
    (p_investor_capital_min IS NULL OR investor_capital >= p_investor_capital_min) AND (p_investor_capital_max IS NULL OR investor_capital <= p_investor_capital_max) as f_investor_capital,
    (p_equity_min IS NULL OR equity >= p_equity_min) AND (p_equity_max IS NULL OR equity <= p_equity_max) as f_equity,
    (p_leverage_min IS NULL OR leverage_percentage >= p_leverage_min) AND (p_leverage_max IS NULL OR leverage_percentage <= p_leverage_max) as f_leverage,
    (p_arv_min IS NULL OR after_repair_value >= p_arv_min) AND (p_arv_max IS NULL OR after_repair_value <= p_arv_max) as f_arv,
    (p_mortgage_min IS NULL OR mortgage_amount >= p_mortgage_min) AND (p_mortgage_max IS NULL OR mortgage_amount <= p_mortgage_max) as f_mortgage,
    (p_purchase_price_min IS NULL OR purchase_price >= p_purchase_price_min) AND (p_purchase_price_max IS NULL OR purchase_price <= p_purchase_price_max) as f_purchase_price,
    (p_rehab_budget_min IS NULL OR rehab_budget >= p_rehab_budget_min) AND (p_rehab_budget_max IS NULL OR rehab_budget <= p_rehab_budget_max) as f_rehab_budget
  FROM base_projects_with_metrics;

  -- 3. Create the final filtered set for main data and summary
  CREATE TEMP TABLE temp_filtered_projects ON COMMIT DROP AS
  SELECT * FROM row_filter_flags
  WHERE 
    f_global_search AND f_address_search AND f_company AND f_lender AND f_status AND 
    f_investor_capital AND f_equity AND f_leverage AND f_arv AND f_mortgage AND 
    f_purchase_price AND f_rehab_budget;

  -- 4. Summary aggregates (after ALL filters, before pagination)
  SELECT jsonb_build_object(
    'total_arv', COALESCE(SUM(after_repair_value), 0),
    'total_equity', COALESCE(SUM(equity), 0),
    'total_investor_capital', COALESCE(SUM(investor_capital), 0)
  ) INTO v_summary FROM temp_filtered_projects;

  -- 5. Fetch main data and total count
  SELECT COUNT(*) FROM temp_filtered_projects INTO v_total;
  EXECUTE format(
    'SELECT jsonb_agg(sub) FROM (SELECT *, company_json as company, lender_org_json as lender_org, title_company_json as title_company FROM temp_filtered_projects ORDER BY %s LIMIT $1 OFFSET $2) sub',
    v_order_clause
  ) INTO v_results USING p_limit, p_offset;

  -- 6. Dynamic Facet Calculation (Independent Facet logic)
  -- Each facet's "available" count is based on applying all filters EXCEPT its own.
  
  -- Define "All filters except X" combinations
  -- f_others = global search + address search + all range filters
  DECLARE
    f_others_expr TEXT := 'f_global_search AND f_address_search AND f_investor_capital AND f_equity AND f_leverage AND f_arv AND f_mortgage AND f_purchase_price AND f_rehab_budget';
  BEGIN
    IF 'company' = ANY(p_facet_columns) THEN
      v_facets := v_facets || jsonb_build_object('company_unique_values', (
        SELECT jsonb_agg(jsonb_build_object('id', id, 'title', name, 'available', c_available, 'total', c_total)) FROM (
          SELECT 
            (company_json->>'id')::uuid as id, 
            company_json->>'name' as name, 
            COUNT(*) FILTER (WHERE f_lender AND f_status AND f_global_search AND f_address_search AND f_investor_capital AND f_equity AND f_leverage AND f_arv AND f_mortgage AND f_purchase_price AND f_rehab_budget) as c_available,
            COUNT(*) as c_total
          FROM row_filter_flags 
          GROUP BY 1, 2 ORDER BY 3 DESC
        ) sub
      ));
    END IF;

    IF 'lender' = ANY(p_facet_columns) THEN
      v_facets := v_facets || jsonb_build_object('lender_unique_values', (
        SELECT jsonb_agg(jsonb_build_object('id', id, 'title', name, 'available', l_available, 'total', l_total)) FROM (
          SELECT 
            (lender_org_json->>'id')::uuid as id, 
            lender_org_json->>'name' as name, 
            COUNT(*) FILTER (WHERE f_company AND f_status AND f_global_search AND f_address_search AND f_investor_capital AND f_equity AND f_leverage AND f_arv AND f_mortgage AND f_purchase_price AND f_rehab_budget) as l_available,
            COUNT(*) as l_total
          FROM row_filter_flags 
          WHERE lender_org_json IS NOT NULL
          GROUP BY 1, 2 ORDER BY 3 DESC
        ) sub
      ));
    END IF;

    IF 'status' = ANY(p_facet_columns) THEN
      v_facets := v_facets || jsonb_build_object('status_unique_values', (
        SELECT jsonb_agg(jsonb_build_object('id', status, 'title', status, 'available', s_available, 'total', s_total)) FROM (
          SELECT 
            status, 
            COUNT(*) FILTER (WHERE f_company AND f_lender AND f_global_search AND f_address_search AND f_investor_capital AND f_equity AND f_leverage AND f_arv AND f_mortgage AND f_purchase_price AND f_rehab_budget) as s_available,
            COUNT(*) as s_total
          FROM row_filter_flags 
          GROUP BY 1 ORDER BY 2 DESC
        ) sub
      ));
    END IF;
  END;

  RETURN jsonb_build_object(
    'data', COALESCE(v_results, '[]'::jsonb),
    'total', COALESCE(v_total, 0),
    'uniqueValues', v_facets,
    'summary', COALESCE(v_summary, '{"total_arv":0,"total_equity":0,"total_investor_capital":0}'::jsonb)
  );
END;
$$ LANGUAGE plpgsql;
