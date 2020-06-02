<template>
  <div class="join p-4 m-4 mx-auto">
    <div class="alert alert-warning" role="alert">
      If <strong>Room Code</strong> isn't available, you'll create a new room
      automatically
    </div>
    <div
      v-if="lastMessage.code > 10000 && lastMessage.code < 20000"
      class="alert alert-danger"
      role="alert"
    >
      {{ lastMessage.message }}
    </div>
    <input
      class="form-control mb-3"
      v-model="username"
      type="text"
      maxlength="8"
      placeholder="Enter Your Name"
    />
    <input
      class="form-control mb-3"
      v-model="room"
      type="text"
      maxlength="8"
      placeholder="Enter Room Code"
    />
    <button
      @click="joinRoom()"
      :disabled="disableJoin"
      type="button"
      class="btn btn-success btn-block"
    >
      {{ isConnected ? "Join Room" : "Connecting" }}
    </button>
  </div>
</template>

<script>
export default {
  metaInfo: {
    title: 'Join Room - Counter Bomber'
  },
  computed: {
    isConnected () {
      return this.$store.state.socket.isConnected
    },
    lastMessage () {
      return this.$store.state.socket.lastMessage
    },
    room: {
      get () {
        return this.$store.state.room
      },
      set (val) {
        this.$store.commit('updateRoom', val)
      }
    },
    username: {
      get () {
        return this.$store.state.username
      },
      set (val) {
        this.$store.commit('updateUsername', val)
      }
    },
    disableJoin () {
      return !this.isConnected || !this.room || !this.username
    }
  },
  watch: {
    lastMessage: {
      handler () {
        if (this.lastMessage.code === 20001) {
          this.$router.push({ name: 'Gameplay' })
        }
      },
      deep: true
    },
    room () {
      this.room = this.room.replace(/[$-/:-?{-~!"^_`[\]\s]/, '')
    },
    username () {
      this.username = this.username.replace(/[$-/:-?{-~!"^_`[\]]/, '')
    }
  },
  mounted () {
    if (this.$route.query.room) {
      this.room = this.$route.query.room
    }

    this.$disconnect()
    this.$connect()
  },
  methods: {
    joinRoom () {
      this.$socket.sendObj({
        join: {
          username: this.username,
          room: this.room
        }
      })
    }
  }
}
</script>

<style lang="scss">
.join {
  background-color: #fff;
  max-width: 450px;

  input {
    text-transform: uppercase;
  }
}
</style>
