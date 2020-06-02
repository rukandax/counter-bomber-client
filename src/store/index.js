import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
export default new Vuex.Store({
  state: {
    socket: {
      lastMessage: {},
      isConnected: false,
      isError: false,
      reconnectError: false
    },
    room: '',
    username: '',
    participant: [],
    isGamePlay: false,
    bombCount: 0,
    explodeCount: 0,
    turnIndex: 999999999,
    canThrow: false
  },
  mutations: {
    SOCKET_ONOPEN (state) {
      state.socket.isConnected = true
      // console.log('Socket Connected')
    },
    SOCKET_ONCLOSE (state) {
      state.socket.isConnected = false
      // console.log('Socket Closed')
    },
    SOCKET_ONERROR (state, event) {
      state.socket.isConnected = false
      state.socket.isError = true

      // console.log(state, event)
    },
    SOCKET_ONMESSAGE (state, message) {
      state.socket.lastMessage = message
      // console.log(message)

      if (
        message.code === 20001 ||
        message.code === 20002 ||
        message.code === 20003 ||
        message.code === 20005
      ) {
        state.participant = message.users
      }

      if (message.code === 20001) {
        state.bombCount = message.bombCount
      }

      if (message.code === 20003) {
        state.explodeCount = message.explodeCount
      }

      if (message.code === 20004) {
        state.turnIndex = message.index
      }

      if (message.code === 20005) {
        state.turnIndex = message.index
        state.bombCount = message.bombCount
        state.explodeCount = message.explodeCount
      }
    },
    SOCKET_RECONNECT () {
      // console.log('Socket Reconnecting')
    },
    SOCKET_RECONNECT_ERROR (state) {
      state.socket.isConnected = false
      state.socket.reconnectError = true

      // console.log('Socket Error')
    },
    updateRoom (state, payload) {
      state.room = payload.toUpperCase()
    },
    updateTurnIndex (state, payload) {
      state.turnIndex = payload
    },
    updateUsername (state, payload) {
      state.username = payload.toUpperCase()
    },
    updateIsGamePlay (state, payload) {
      state.isGamePlay = payload
    },
    updateCanThrow (state, payload) {
      state.canThrow = payload
    }
  }
})
