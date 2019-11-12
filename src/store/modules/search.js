import get from '../../app/api'
import router from '../../app/router'

const model = () => {
  return {
    params: {
      terms: null,
      user: null,
      limit: 10
    },
    results: {
      users: {
        data: [],
        offset: 0,
        isMore: true
      },
      messages: {
        data: [],
        offset: 0,
        isMore: true
      },
      posts: {
        data: [],
        offset: 0,
        isMore: true
      }
    },
    modal: false,
    active: null
  }
}

export default {
  namespaced: true,
  state() {
    return model()
  },
  mutations: {
    SEARCH_TERMS(state, terms) {
      state.params.terms = terms
    },
    RESULTS_ADD(state, { results, method }) {
      if (results && results.length) state.results[`${method}s`].data.push(...results)
    },
    RESULTS_DEL(state) {
      const terms = state.params.terms
      Object.assign(state, model())
      state.params.terms = terms
    },
    OFFSET(state, method) {
      state.results[`${method}s`].offset = state.results[`${method}s`].offset + state.params.limit
    },
    NO_MORE(state, method) {
      state.results[method].isMore = false
    },
    MODAL_TOGGLE(state) {
      state.modal = !state.modal
    },
    ACTIVE(state) {
      state.active = `${state.params.terms}`
    }
  },
  actions: {
    async search({ commit, state, dispatch }, event) {
      try {
        if (event) {
          event.preventDefault()
          window.location.assign(`/search?q=${state.params.terms}`)
        }
        dispatch('toggleModal')
        dispatch('deleteResults')
        dispatch('setActive')
        dispatch('loading', null, { root: true })

        const [users, messages, posts] = await Promise.all([
          get('user', { ...state.params, offset: state.results['users'].offset }),
          get('message', { ...state.params, offset: state.results['messages'].offset }),
          get('post', { ...state.params, offset: state.results['posts'].offset })
        ])

        if (users) {
          if (users.length) commit('RESULTS_ADD', { results: users, method: 'user' })
          if (users.length < 10) dispatch('noMore', 'users')
        }

        if (messages) {
          if (messages.length) commit('RESULTS_ADD', { results: messages, method: 'message' })
          if (messages.length < 10) dispatch('noMore', 'messages')
        }

        if (posts) {
          if (posts.length) commit('RESULTS_ADD', { results: posts, method: 'post' })
          if (posts.length < 10) dispatch('noMore', 'posts')
        }

        dispatch('loading', null, { root: true })
      } catch (err) {
        Console.error(err)
        dispatch('loading', null, { root: true })
        dispatch('error', err.message, { root: true })
      }
    },
    async more({ commit, state, dispatch }, method) {
      const params = { ...state.params }
      params.offset = state.results[`${method}s`].offset + state.params.limit

      try {
        dispatch('loading', null, { root: true })
        const results = await get(method, params)
        if (!results || results.length < state.params.limit) dispatch('noMore', method)
        if (results) {
          commit('RESULTS_ADD', { results, method })
          dispatch('offset', method)
        }
        dispatch('loading', null, { root: true })
      } catch (err) {
        Console.error(err)
        dispatch('loading', null, { root: true })
        dispatch('error', err.message, { root: true })
      }
    },
    setTerms({ commit }, terms) {
      commit('SEARCH_TERMS', terms)
    },
    deleteResults({ commit }) {
      commit('RESULTS_DEL')
    },
    offset({ commit }, method) {
      commit('OFFSET', method)
    },
    noMore({ commit }, method) {
      commit('NO_MORE', method)
    },
    toggleModal({ commit }) {
      commit('MODAL_TOGGLE')
    },
    setActive({ commit }) {
      commit('ACTIVE')
    }
  }
}
