import { mount, diff, createElement, render } from './lib/vdom.js'

interface Props {
    count: number
}

const createVApp = ({ count }: Props) => {
    let _count = count
    
    setInterval(() => {
        _count++
    }, 1000)

    return () => createElement(
        'div',
        { id: 'container', 'data-count': _count },
        createElement('h1', undefined, 'Hello World - ', createElement('span', { id: 'count' }, String(_count))),
        createElement(
            'form',
            undefined,
            createElement(
                'div',
                { className: 'form-input' },
                createElement('input', { id: 'email', type: 'text', placeholder: '', }),
                createElement('label', { for: 'email' }, 'Email ')
            ),
            createElement('button', { type: 'submit' }, 'Submit')
        ),
        createElement('p', undefined, 'Hey there'),
        createElement('img', {
            src: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2lkemZ5eXhkdnZoeG4yZ3NwazF0ZDJwNG9nempyM3lmcnBjcDhsZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/R6gvnAxj2ISzJdbA63/giphy-downsized-large.gif',
            alt: 'Gif of "I love you" sign'
        })
    )
}

let vAppFct = createVApp({ count: 0 })
let vApp = vAppFct()
const appElement = document.getElementById('app') as HTMLElement;
const app = render(vApp)
// Mount the app
let $rootEl = mount(app, appElement)

setInterval(() => {
    const vNewApp = vAppFct()
    const patch = diff(vApp, vNewApp)

    // Check if the patch does not return undefined
    const patchedRoot = patch($rootEl);
    if (patchedRoot) {
        $rootEl = patchedRoot;
    }

    vApp = vNewApp

}, 1000)
