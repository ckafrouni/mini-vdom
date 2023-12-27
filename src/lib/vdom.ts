/**
 * Basic virtual DOM implementation.
 * 
 * [Building a Simple Virtual DOM from Scratch - Jason Yu](https://www.youtube.com/watch?v=85gJMUEcnkc)
 */

interface Options {
    attrs?: object
    children?: Array<vNode | string>
}

interface vNode {
    tagName: string
    attrs: object
    children: Array<vNode | string>
}

export const createElement = (tagName: string, { attrs = {}, children = [] }: Options): vNode => ({
    tagName,
    attrs,
    children,
})

export const render = (vNode: vNode | string): HTMLElement | Text => {
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

export const mount = ($node: HTMLElement | Text, $target: HTMLElement): HTMLElement | Text => {
    $target.replaceWith($node)
    return $node
}

const diffAttrs = (oldAttrs: object, newAttrs: object): Function => {
    const patches: Array<Function> = []

    // Set new attributes
    for (const [k, v] of Object.entries(newAttrs)) {
        patches.push(($node: HTMLElement) => {
            $node.setAttribute(k, v)
            return $node
        })
    }

    // Remove old attributes
    for (const k in oldAttrs) {
        if (!(k in newAttrs)) {
            patches.push(($node: HTMLElement) => {
                $node.removeAttribute(k)
                return $node
            })
        }
    }

    return ($node: Node) => {
        for (const patch of patches) {
            patch($node)
        }
    }
}

const diffChildren = (oldVChildren: Array<any>, newVChildren: Array<any>): Function => {
    const childPatches: Array<Function> = []
    oldVChildren.forEach((oldVChild, i) => {
        childPatches.push(diff(oldVChild, newVChildren[i]))
    })

    const additionalPatches: Array<Function> = []
    for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
        additionalPatches.push(($node: Node) => {
            $node.appendChild(render(additionalVChild))
            return $node
        })
    }

    return ($parent: Node) => {
        const childNodes = Array.from($parent.childNodes); // Convert NodeListOf<ChildNode> to an array
        for (const [patch, $child] of zip(childPatches, childNodes)) {
            patch($child)
        }

        for (const patch of additionalPatches) {
            patch($parent)
        }

        return $parent
    }
}

const zip = (xs: Array<any>, ys: Array<any>): Array<Array<any>> => {
    const zipped: Array<Array<any>> = []
    for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
        zipped.push([xs[i], ys[i]])
    }
    return zipped
}

export const diff = (vOldNode: vNode, vNewNode: vNode): Function => {
    if (vNewNode === undefined) {
        return ($node: HTMLElement) => {
            $node.remove()
            return undefined
        }
    }

    if (typeof vOldNode === 'string' || typeof vNewNode === 'string') {
        if (vOldNode !== vNewNode) {
            return ($node: HTMLElement) => {
                const $newNode = render(vNewNode)
                $node.replaceWith($newNode)
                return $newNode
            }
        } else {
            return ($node: Node) => undefined
        }
    }

    if (vOldNode.tagName !== vNewNode.tagName) {
        return ($node: HTMLElement) => {
            const $newNode = render(vNewNode)
            $node.replaceWith($newNode)
            return $newNode
        }
    }

    const patchAttrs = diffAttrs(vOldNode.attrs, vNewNode.attrs)
    const patchChildren = diffChildren(vOldNode.children, vNewNode.children)

    return ($node: Node) => {
        patchAttrs($node)
        patchChildren($node)
        return $node
    }
}
