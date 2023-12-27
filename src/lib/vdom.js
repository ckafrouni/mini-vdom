/**
 * Basic virtual DOM implementation.
 * 
 * [Building a Simple Virtual DOM from Scratch - Jason Yu](https://www.youtube.com/watch?v=85gJMUEcnkc)
 */

/**
 * A virtual DOM element (roughly).
 * 
 * @typedef {Object} vNode
 * @property {string} tagName - The name of the HTML tag.
 * @property {object} attrs - The attributes of the element.
 * @property {array<vNode|string>} children - The children of the element.
 */

/**
 * Creates a virtual DOM element.
 *
 * @param {string} tagName - The name of the HTML tag.
 * @param {object} options - The options for the element.
 * @param {object} options.attrs - The attributes of the element.
 * @param {array<vNode|string>} options.children - The children of the element.
 * @returns {vNode} A virtual DOM element.
 */
export const createElement = (tagName, { attrs = {}, children = [] } = {}) => ({
    tagName,
    attrs,
    children,
})

/**
 * Renders a virtual DOM node into a real DOM element.
 * @param {vNode|string} vNode - The virtual DOM node to render.
 * @returns {Node} - The rendered DOM element.
 */
export const render = (vNode) => {
    if (typeof vNode === 'string') {
        return document.createTextNode(vNode)
    }

    const $el = document.createElement(vNode.tagName)

    // Set attributes
    for (const [k, v] of Object.entries(vNode.attrs)) {
        $el.setAttribute(k, v)
    }

    // Set children
    vNode.children.forEach((child) => {
        $el.appendChild(render(child))
    })

    return $el
}

/**
 * Mounts a node onto a target element, replacing the target element with the node.
 * 
 * @param {Node} $node - The node to be mounted.
 * @param {Node} $target - The target element to be replaced.
 * @returns {Node} The mounted node.
 */
export const mount = ($node, $target) => {
    $target.replaceWith($node)
    return $node
}

/**
 * Calculates the difference between old and new attributes and returns a function that applies the necessary patches to a DOM node.
 * @param {Object} oldAttrs - The old attributes object.
 * @param {Object} newAttrs - The new attributes object.
 * @returns {Function} - A function that applies the necessary patches to a DOM node.
 */
const diffAttrs = (oldAttrs, newAttrs) => {
    /** @typedef {Function} patch */

    /** @type {array<patch>} */
    const patches = []

    // Set new attributes
    for (const [k, v] of Object.entries(newAttrs)) {
        patches.push(($node) => {
            $node.setAttribute(k, v)
            return $node
        })
    }

    // Remove old attributes
    for (const k in oldAttrs) {
        if (!(k in newAttrs)) {
            patches.push(($node) => {
                $node.removeAttribute(k)
                return $node
            })
        }
    }

    return ($node) => {
        for (const patch of patches) {
            patch($node)
        }
    }
}

/**
 * Performs diffing between old and new virtual children and returns a function that applies the patches to the parent node.
 * @param {Array} oldVChildren - The array of old virtual children.
 * @param {Array} newVChildren - The array of new virtual children.
 * @returns {Function} - A function that applies the patches to the parent node.
 */
const diffChildren = (oldVChildren, newVChildren) => {
    const childPatches = []
    oldVChildren.forEach((oldVChild, i) => {
        childPatches.push(diff(oldVChild, newVChildren[i]))
    })

    const additionalPatches = []
    for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
        additionalPatches.push(($node) => {
            $node.appendChild(render(additionalVChild))
            return $node
        })
    }

    return ($parent) => {
        for (const [patch, $child] of zip(childPatches, $parent.childNodes)) {
            patch($child)
        }

        for (const patch of additionalPatches) {
            patch($parent)
        }

        return $parent
    }
}

/**
 * Zips two arrays together into an array of pairs.
 *
 * @param {Array} xs - The first array.
 * @param {Array} ys - The second array.
 * @returns {Array} - The zipped array of pairs.
 */
const zip = (xs, ys) => {
    const zipped = []
    for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
        zipped.push([xs[i], ys[i]])
    }
    return zipped
}

/**
 * Calculates the difference between two virtual DOM nodes and returns a patch function.
 * The patch function can be applied to a real DOM node to update it based on the difference.
 * @param {Object} vOldNode - The old virtual DOM node.
 * @param {Object} vNewNode - The new virtual DOM node.
 * @returns {Function} - The patch function that can be applied to a real DOM node.
 */
export const diff = (vOldNode, vNewNode) => {
    if (vNewNode === undefined) {
        return ($node) => {
            $node.remove()
            return undefined
        }
    }

    if (typeof vOldNode === 'string' || typeof vNewNode === 'string') {
        if (vOldNode !== vNewNode) {
            return ($node) => {
                const $newNode = render(vNewNode)
                $node.replaceWith($newNode)
                return $newNode
            }
        } else {
            return ($node) => undefined
        }
    }

    if (vOldNode.tagName !== vNewNode.tagName) {
        return ($node) => {
            const $newNode = render(vNewNode)
            $node.replaceWith($newNode)
            return $newNode
        }
    }

    const patchAttrs = diffAttrs(vOldNode.attrs, vNewNode.attrs)
    const patchChildren = diffChildren(vOldNode.children, vNewNode.children)

    return ($node) => {
        patchAttrs($node)
        patchChildren($node)
        return $node
    }
}
