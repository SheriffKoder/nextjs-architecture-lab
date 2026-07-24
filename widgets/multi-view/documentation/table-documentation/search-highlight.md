# Search Highlighting Implementation

## Overview

This document describes how search highlighting works in the VirtualizedTable component. The implementation searches underlying data values (not React element structures) and highlights matching text while preserving the original styled cell structure.

## Changes Made

### 1. Search Underlying Data, Not React Elements (lines 368-371)

- Added `searchableText` that uses `formatter` or `formatCellValue` to get the searchable value from raw data
- This is what gets matched against the search term

### 2. Only Highlight If Data Matches (lines 414-434)

- Check if `searchableText` contains the search term
- Only then apply highlighting to `displayValue` (the styled React element)

### 3. Preserve React Element Structure (lines 85-125)

- Added `highlightTextInElement()` that recursively highlights text within React elements
- Preserves the original element structure and styling (e.g., `className="text-gray-500 text-sm"`)
- Only highlights the text content, not the element structure

## How It Works Now

1. **Search**: Uses `formatter(value)` or `formatCellValue({ value, column })` to get searchable text from raw data
2. **Match Check**: Compares searchable text with search term (case-insensitive)
3. **Highlight**: If match found, highlights text within the `displayValue` (whether it's a string or React element from `cellRenderer`)
4. **Preserve**: Maintains original styling and structure of React elements

## Example for `created` Column

- **Raw data**: `"2026-01-05T14:30:18..."`
- **Searchable text**: `"Jan 5, 2026"` (via formatter)
- **Display value**: `<div className="text-gray-500 text-sm">Jan 5, 2026</div>` (via cellRenderer)
- **If search matches "Jan"**: It highlights "Jan" within the styled div

## Summary

Search now works on the underlying data, and highlighting preserves the styled cell structure.
