import { mount, diff, createElement, render } from './lib/vdom.js'

interface Props {
    count: number
}

const createVApp = ({ count }: Props) => {
    return createElement('div', {
        attrs: {
            id: 'app',
            dataCount: count,
        },
        children: [
            createElement('h1', {
                children: [
                    'Hello World',
                    ' - ',
                    createElement('span', {
                        attrs: {
                            id: 'count',
                        },
                        children: [String(count)],
                    })
                ],
            }),

            createElement('form', {
                children: [
                    createElement('div', {
                        attrs: {
                            class: 'form-input',
                        },
                        children: [
                            createElement('input', {
                                attrs: {
                                    id: 'email',
                                    type: 'text',
                                    placeholder: '',
                                }
                            }),
                            createElement('label', {
                                attrs: {
                                    for: 'email',
                                },
                                children: ['Email '],
                            }),
                        ]
                    }),
                    createElement('button', {
                        attrs: {
                            type: 'submit',
                        },
                        children: ['Submit'],
                    }),
                ]
            }),

            createElement('p', {
                children: [
                    'Hey there',

                ],
            }),

            createElement('img', {
                attrs: {
                    src: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2lkemZ5eXhkdnZoeG4yZ3NwazF0ZDJwNG9nempyM3lmcnBjcDhsZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/R6gvnAxj2ISzJdbA63/giphy-downsized-large.gif',
                },
            })
        ],
    })
}


let count = 0

let vApp = createVApp({ count })
const $app = render(vApp)

let $rootEl = mount($app, document.getElementById('app') as HTMLElement)

setInterval(() => {
    count++
    const vNewApp = createVApp({ count })
    const patch = diff(vApp, vNewApp)
    $rootEl = patch($rootEl)
    vApp = vNewApp
}, 1000)
