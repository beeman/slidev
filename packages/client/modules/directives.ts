import { App, DirectiveBinding, InjectionKey, Ref, watch } from 'vue'
import { remove } from '@antfu/utils'
import { isPrintMode } from '../state'

export const injectionClicks: InjectionKey<Ref<number>> = Symbol('v-click-clicks')
export const injectionClicksElements: InjectionKey<Ref<(Element | string)[]>> = Symbol('v-click-clicks-elements')
export const injectionClicksDisabled: InjectionKey<Ref<boolean>> = Symbol('v-click-clicks-disabled')

function dirInject<T = unknown>(dir: DirectiveBinding<any>, key: InjectionKey<T> | string, defaultValue?: T): T | undefined {
  return (dir.instance?.$ as any).provides[key as any] ?? defaultValue
}

export default function createDirectives() {
  return {
    install(app: App) {
      app.directive('click', {
        // @ts-expect-error
        name: 'v-click',

        mounted(el: HTMLElement, dir) {
          if (isPrintMode.value || dirInject(dir, injectionClicksDisabled)!.value)
            return

          const elements = dirInject(dir, injectionClicksElements)!
          const clicks = dirInject(dir, injectionClicks)!

          const prev = elements.value.length

          if (!elements.value.includes(el))
            elements.value.push(el)

          watch(
            clicks,
            () => {
              const show = dir.value != null
                ? clicks.value >= dir.value
                : clicks.value > prev
              if (!el.classList.contains('v-click-hidden-explicitly'))
                el.classList.toggle('v-click-hidden', !show)
            },
            { immediate: true },
          )
        },
        unmounted(el, dir) {
          const elements = dirInject(dir, injectionClicksElements)!
          if (elements?.value)
            remove(elements.value, el)
        },
      })

      app.directive('after', {
        // @ts-expect-error
        name: 'v-after',

        mounted(el: HTMLElement, dir) {
          if (isPrintMode.value || dirInject(dir, injectionClicksDisabled)!.value)
            return

          const elements = dirInject(dir, injectionClicksElements)!
          const clicks = dirInject(dir, injectionClicks)!

          const prev = elements.value.length

          watch(
            clicks,
            () => {
              const show = clicks.value >= (dir.value ?? prev)
              if (!el.classList.contains('v-click-hidden-explicitly'))
                el.classList.toggle('v-click-hidden', !show)
            },
            { immediate: true },
          )
        },
      })

      app.directive('click-hide', {
        // @ts-expect-error
        name: 'v-click-hide',

        mounted(el: HTMLElement, dir) {
          if (isPrintMode.value || dirInject(dir, injectionClicksDisabled)!.value)
            return

          const clicks = dirInject(dir, injectionClicks)!

          watch(
            clicks,
            () => {
              const hide = clicks.value > dir.value
              el.classList.toggle('v-click-hidden', hide)
              el.classList.toggle('v-click-hidden-explicitly', hide)
            },
            { immediate: true },
          )
        },
        unmounted(el, dir) {
          const elements = dirInject(dir, injectionClicksElements)!
          if (elements?.value)
            remove(elements.value, el)
        },
      })
    },
  }
}
