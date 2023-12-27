/**
 * Basic virtual DOM implementation.
 * 
 * [Building a Simple Virtual DOM from Scratch - Jason Yu](https://www.youtube.com/watch?v=85gJMUEcnkc)
 */

interface Options {
    attrs?: Record<string, string>
    children?: Child[]
}

interface vNode {
    tagName: string
    attrs: Record<string, string>
    children: Child[]
}

type Child = vNode | string

type PatchFunction = ($node: HTMLElement | Text) => HTMLElement | Text | undefined;

export const createElement = (tagName: string, attrs = {}, ...children: Child[]): vNode => ({
    tagName,
    attrs,
    children,
})

export const render = (vNode: Child): HTMLElement | Text => {
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

const diffAttrs = (oldAttrs: Record<string, string>, newAttrs: Record<string, string>): PatchFunction => {
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

    return ($node: HTMLElement | Text) => {
        for (const patch of patches) {
            patch($node)
        }
        return $node;
    }
}

const diffChildren = (oldVChildren: Child[], newVChildren: Child[]): PatchFunction => {
    const childPatches: Array<Function> = []
    oldVChildren.forEach((oldVChild, i) => {
        childPatches.push(diff(oldVChild, newVChildren[i]))
    })

    const additionalPatches: Array<Function> = []
    for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
        additionalPatches.push(($node: HTMLElement) => {
            $node.appendChild(render(additionalVChild))
            return $node
        })
    }

    return ($parent: HTMLElement | Text) => {
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

const zip = <T, U>(xs: T[], ys: U[]): Array<[T, U]> => {
    const zipped: Array<[T, U]> = []
    for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
        zipped.push([xs[i], ys[i]])
    }
    return zipped
}

export const diff = (vOldNode: vNode | string, vNewNode: vNode | string): PatchFunction => {
    if (vNewNode === undefined) {
        return ($node: HTMLElement | Text) => {
            $node.remove()
            return undefined
        }
    }

    if (typeof vOldNode === 'string' || typeof vNewNode === 'string') {
        if (vOldNode !== vNewNode) {
            return ($node: HTMLElement | Text) => {
                const $newNode = render(vNewNode)
                $node.replaceWith($newNode)
                return $newNode
            }
        } else {
            return ($node: HTMLElement | Text) => $node
        }
    }

    if (vOldNode.tagName !== vNewNode.tagName) {
        return ($node: HTMLElement | Text) => {
            const $newNode = render(vNewNode)
            $node.replaceWith($newNode)
            return $newNode
        }
    }

    const patchAttrs = diffAttrs(vOldNode.attrs, vNewNode.attrs)
    const patchChildren = diffChildren(vOldNode.children, vNewNode.children)

    return ($node: HTMLElement | Text) => {
        patchAttrs($node)
        patchChildren($node)
        return $node
    }
}
