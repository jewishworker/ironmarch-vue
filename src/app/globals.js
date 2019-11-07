import InlineSvg from 'vue-inline-svg'
import SvgIcon from '../components/SvgIcon.vue'

const globals = Vue => {
  Vue.component('SvgIcon', SvgIcon)
  Vue.component('InlineSvg', InlineSvg)
}

export default globals
