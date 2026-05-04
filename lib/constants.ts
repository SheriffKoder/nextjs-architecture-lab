export const INTERNAL_ORG_ID = "019be079-d528-77ad-bb2b-2c7590149e3b";

export enum RoleEnum {
  ADMIN = "admin",
  USER = "user",
}

export enum AllocationStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum AllocationPaymentTermEnum {
  MONTHLY = "monthly",
  ANNUALLY = "annually",
  AT_MATURITY = "at maturity",
}

export enum AllocationInvestmentTypeEnum {
  COMPOUNDED_INTEREST = "compounded interest",
  MONTHLY_INTEREST = "monthly interest",
  PROFIT_SPLIT = "profit split",
}

export enum AllocationInvestmentMethodEnum {
  CASH = "cash",
  IRA = "IRA",
  TRUST = "trust",
}

export enum ProjectStatusEnum {
  ACTIVE_CONSTRUCTION = "active construction",
  SOLD = "sold",
  FOR_SALE = "for sale",
  PENDING_PURCHASE = "pending purchase",
  RENTAL_PROPERTIES = "rental properties",
}

export enum OrgTypeEnum {
  INTERNAL = "internal",
  INVESTOR = "investor",
  LENDER = "lender",
  REALTOR = "realtor",
  CONTRACTOR = "contractor",
}