/**
 * Filter Builder Hook
 * 
 * Purpose: State management hook for filter tree operations
 * Used in: QueryBuilder component
 * Why: Provides centralized API for managing filter AST
 */

'use client'

import { useState, useCallback } from 'react'
import type { FilterNode, FilterGroup, FilterCondition, Logic } from '../types/filter'
import { generateNodeId } from '../utils/generate-node-id'

/**
 * Recursively find a node by ID in the filter tree
 */
function findNodeById(node: FilterNode, id: string): FilterNode | null {
  if (node.id === id) return node
  
  if (node.type === 'group') {
    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }
  
  return null
}

/**
 * Recursively find parent group of a node
 */
function findParentGroup(
  root: FilterGroup,
  targetId: string,
  parent: FilterGroup | null = null
): FilterGroup | null {
  if (root.id === targetId) return parent
  
  for (const child of root.children) {
    if (child.id === targetId) return root
    
    if (child.type === 'group') {
      const found = findParentGroup(child, targetId, root)
      if (found) return found
    }
  }
  
  return null
}

/**
 * Recursively update node in tree (immutable)
 */
function updateNodeInTree(
  node: FilterNode,
  targetId: string,
  updater: (node: FilterNode) => FilterNode
): FilterNode {
  if (node.id === targetId) {
    return updater(node)
  }
  
  if (node.type === 'group') {
    return {
      ...node,
      children: node.children.map(child => updateNodeInTree(child, targetId, updater))
    }
  }
  
  return node
}

/**
 * Recursively remove node from tree (immutable)
 */
function removeNodeFromTree(node: FilterNode, targetId: string): FilterNode | null {
  if (node.id === targetId) return null
  
  if (node.type === 'group') {
    const filteredChildren = node.children
      .map(child => removeNodeFromTree(child, targetId))
      .filter((child): child is FilterNode => child !== null)
    
    return {
      ...node,
      children: filteredChildren
    }
  }
  
  return node
}

/**
 * useFilterBuilder hook - manages filter tree state
 * WHY: Provides centralized API for filter tree operations
 * HOW: Uses useState for tree state, provides mutation functions
 */
export function useFilterBuilder(initialTree: FilterNode | null = null) {
  const [filterTree, setFilterTree] = useState<FilterNode | null>(initialTree)

  /**
   * Get node by ID
   */
  const getNodeById = useCallback((id: string): FilterNode | null => {
    if (!filterTree) return null
    return findNodeById(filterTree, id)
  }, [filterTree])

  /**
   * Get parent group of a node
   */
  const getParentGroup = useCallback((nodeId: string): FilterGroup | null => {
    if (!filterTree || filterTree.type !== 'group') return null
    return findParentGroup(filterTree, nodeId)
  }, [filterTree])

  /**
   * Add condition to a group
   */
  const addCondition = useCallback((groupId: string) => {
    setFilterTree(prev => {
      const newCondition: FilterCondition = {
        type: 'condition',
        id: generateNodeId(),
        field: '',
        operator: ''
      }

      if (!prev || prev.type !== 'group') {
        // Create root group if doesn't exist
        return {
          type: 'group',
          id: generateNodeId(),
          logic: 'and',
          children: [newCondition]
        }
      }

      // If groupId is empty, add to root
      if (!groupId || groupId === prev.id) {
        return {
          ...prev,
          children: [...prev.children, newCondition]
        }
      }

      return updateNodeInTree(prev, groupId, (node) => {
        if (node.type === 'group') {
          return {
            ...node,
            children: [...node.children, newCondition]
          }
        }
        return node
      }) as FilterNode
    })
  }, [])

  /**
   * Add nested group to a group
   */
  const addGroup = useCallback((parentGroupId: string) => {
    setFilterTree(prev => {
      const newGroup: FilterGroup = {
        type: 'group',
        id: generateNodeId(),
        logic: 'and',
        children: []
      }

      if (!prev || prev.type !== 'group') {
        // Create root group with nested group
        return {
          type: 'group',
          id: generateNodeId(),
          logic: 'and',
          children: [newGroup]
        }
      }

      // If parentGroupId is empty, add to root
      if (!parentGroupId || parentGroupId === prev.id) {
        return {
          ...prev,
          children: [...prev.children, newGroup]
        }
      }

      return updateNodeInTree(prev, parentGroupId, (node) => {
        if (node.type === 'group') {
          return {
            ...node,
            children: [...node.children, newGroup]
          }
        }
        return node
      }) as FilterNode
    })
  }, [])

  /**
   * Remove node (condition or group)
   */
  const removeNode = useCallback((nodeId: string) => {
    setFilterTree(prev => {
      if (!prev) return null
      
      // If removing root, return null
      if (prev.id === nodeId) return null
      
      const result = removeNodeFromTree(prev, nodeId)
      return result
    })
  }, [])

  /**
   * Update condition field
   */
  const updateConditionField = useCallback((nodeId: string, field: string) => {
    setFilterTree(prev => {
      if (!prev) return null
      
      return updateNodeInTree(prev, nodeId, (node) => {
        if (node.type === 'condition') {
          return {
            ...node,
            field,
            // Reset operator and value when field changes
            operator: '',
            value: undefined,
            dateType: undefined
          }
        }
        return node
      }) as FilterNode
    })
  }, [])

  /**
   * Update condition operator
   */
  const updateConditionOperator = useCallback((nodeId: string, operator: string) => {
    setFilterTree(prev => {
      if (!prev) return null
      
      return updateNodeInTree(prev, nodeId, (node) => {
        if (node.type === 'condition') {
          return {
            ...node,
            operator,
            // Clear value for empty operators
            value: (operator === 'is_empty' || operator === 'is_not_empty') ? undefined : node.value
          }
        }
        return node
      }) as FilterNode
    })
  }, [])

  /**
   * Update condition value
   */
  const updateConditionValue = useCallback((nodeId: string, value: unknown) => {
    setFilterTree(prev => {
      if (!prev) return null
      
      return updateNodeInTree(prev, nodeId, (node) => {
        if (node.type === 'condition') {
          return {
            ...node,
            value
          }
        }
        return node
      }) as FilterNode
    })
  }, [])

  /**
   * Update condition date type
   */
  const updateConditionDateType = useCallback((nodeId: string, dateType: string) => {
    setFilterTree(prev => {
      if (!prev) return null
      
      return updateNodeInTree(prev, nodeId, (node) => {
        if (node.type === 'condition') {
          return {
            ...node,
            dateType,
            // Clear value when date type changes (will be set by value input)
            value: undefined
          }
        }
        return node
      }) as FilterNode
    })
  }, [])

  /**
   * Update group logic
   */
  const updateGroupLogic = useCallback((groupId: string, logic: Logic) => {
    setFilterTree(prev => {
      if (!prev) return null
      
      return updateNodeInTree(prev, groupId, (node) => {
        if (node.type === 'group') {
          return {
            ...node,
            logic
          }
        }
        return node
      }) as FilterNode
    })
  }, [])

  /**
   * Move node up in its parent group
   */
  const moveNodeUp = useCallback((nodeId: string) => {
    setFilterTree(prev => {
      if (!prev || prev.type !== 'group') return prev
      
      const parentGroup = findParentGroup(prev, nodeId)
      if (!parentGroup) {
        // Node is in root group
        const index = prev.children.findIndex(child => child.id === nodeId)
        if (index <= 0) return prev
        
        const newChildren = [...prev.children]
        ;[newChildren[index - 1], newChildren[index]] = [newChildren[index], newChildren[index - 1]]
        return { ...prev, children: newChildren }
      }
      
      // Node is in nested group - find the nested group and update it
      return updateNodeInTree(prev, parentGroup.id, (node) => {
        if (node.type === 'group') {
          const index = node.children.findIndex(child => child.id === nodeId)
          if (index <= 0) return node
          
          const newChildren = [...node.children]
          ;[newChildren[index - 1], newChildren[index]] = [newChildren[index], newChildren[index - 1]]
          return { ...node, children: newChildren }
        }
        return node
      }) as FilterNode
    })
  }, [])

  /**
   * Move node down in its parent group
   */
  const moveNodeDown = useCallback((nodeId: string) => {
    setFilterTree(prev => {
      if (!prev || prev.type !== 'group') return prev
      
      const parentGroup = findParentGroup(prev, nodeId)
      if (!parentGroup) {
        // Node is in root group
        const index = prev.children.findIndex(child => child.id === nodeId)
        if (index < 0 || index >= prev.children.length - 1) return prev
        
        const newChildren = [...prev.children]
        ;[newChildren[index], newChildren[index + 1]] = [newChildren[index + 1], newChildren[index]]
        return { ...prev, children: newChildren }
      }
      
      // Node is in nested group - find the nested group and update it
      return updateNodeInTree(prev, parentGroup.id, (node) => {
        if (node.type === 'group') {
          const index = node.children.findIndex(child => child.id === nodeId)
          if (index < 0 || index >= node.children.length - 1) return node
          
          const newChildren = [...node.children]
          ;[newChildren[index], newChildren[index + 1]] = [newChildren[index + 1], newChildren[index]]
          return { ...node, children: newChildren }
        }
        return node
      }) as FilterNode
    })
  }, [])

  /**
   * Set filter tree (for external updates, e.g., from URL)
   */
  const setFilter = useCallback((tree: FilterNode | null) => {
    setFilterTree(tree)
  }, [])

  /**
   * Clear filter tree
   */
  const clearFilter = useCallback(() => {
    setFilterTree(null)
  }, [])

  return {
    filterTree,
    setFilter,
    clearFilter,
    getNodeById,
    getParentGroup,
    addCondition,
    addGroup,
    removeNode,
    updateConditionField,
    updateConditionOperator,
    updateConditionValue,
    updateConditionDateType,
    updateGroupLogic,
    moveNodeUp,
    moveNodeDown,
  }
}
