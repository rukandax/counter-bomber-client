<template>
  <div class="bg-white p-4 m-4">
    <div
      :class="{ show: availableParticipantReady && !isGamePlay }"
      class="overlay position-absolute text-center"
    >
      <h1>Game will start in...</h1>
      <h1 class="font-weight-bold">{{ timer }}</h1>
    </div>

    <div
      v-if="availableParticipant.length"
      :class="{ show: isGameFinish }"
      class="overlay position-absolute text-center"
    >
      <img
        class="mb-5"
        :src="
          `https://api.adorable.io/avatars/200/${availableParticipant[0].username}-${availableParticipant[0].color}`
        "
        alt
      />
      <h1 class="font-weight-bold">
        The Winner - {{ availableParticipant[0].username }}
      </h1>
    </div>

    <div class="alert alert-warning alert-dismissible fade show" role="alert">
      Please don't refresh this page or you will kick out from the room
      <button
        type="button"
        class="close"
        data-dismiss="alert"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="fixed-bottom pt-3 bg-white">
      <div class="container">
        <template v-if="!isGamePlay">
          <button
            type="button"
            class="btn btn-sm btn-block mb-3"
            :class="!isMyUserReady ? 'btn-primary' : 'btn-danger'"
            @click="toggleReady(isMyUserReady)"
          >
            <template v-if="availableParticipant.length <= 1"
              >Waiting for Others</template
            >
            <template v-else>
              {{
                isMyUserReady ? "Set Not Ready" : "&gt;&gt; Set Ready &lt;&lt;"
              }}
            </template>
          </button>
        </template>

        <template v-else>
          <button
            type="button"
            class="btn btn-danger btn-sm btn-block mb-3"
            :disabled="!isMyTurn"
            @click="punch()"
          >
            &gt;&gt; Punch Bomb ({{ punchLeft }} left) &lt;&lt;
          </button>
          <button
            type="button"
            class="btn btn-warning btn-sm btn-block mb-3"
            :disabled="!isMyTurn || !canThrow"
            @click="nextTurn"
          >
            &gt;&gt; Throw
            <span v-if="!canThrow">(1 Punch to Enable)</span> &lt;&lt;
          </button>
        </template>
      </div>
    </div>

    <div class="row m-0 mb-3">
      <div
        class="main-section col-xl-4 d-flex align-items-center col-lg-6 px-4 text-center bg-primary text-white justify-content-center"
      >
        <div class="text-center mb-3">
          <span class="counter font-weight-bold">
            {{ isGamePlay ? bombLeft : "??" }}
          </span>
          Punch(es) before explode
        </div>
      </div>
      <div
        class="main-section col-xl-4 d-flex align-items-center col-lg-6 px-4 text-center bg-success text-white justify-content-center"
      >
        <div class="text-center mb-3">
          <span class="counter font-weight-bold">{{
            bombTimer ? bombTimer : "??"
          }}</span>
          Second(s) before explode
        </div>
      </div>
      <div class="col-xl-4 col-lg-12 p-4 bg-info text-white font-weight-bold">
        <div class="mb-2">Your Name : {{ username }}</div>
        <div class="mb-2">Game Room : {{ room }}</div>
        <div class="form-group">
          <label>Invite your friends</label>
          <div class="input-group mb-3">
            <input
              type="text"
              class="form-control"
              id="copy-link"
              :value="`https://madeby.rukanda.xyz/counter-bomber/?room=${room}`"
              readonly
            />
            <div class="input-group-append">
              <button
                class="btn btn-secondary clipboard"
                type="button"
                data-clipboard-target="#copy-link"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row m-0">
      <div
        v-for="(user, userIndex) in participant"
        :key="`username-${user.username}`"
        class="text-center col-md-6 col-xl-4 px-0 border participant"
      >
        <div
          class="h-25px display-block border-bottom"
          :style="`background-color: #${user.color}`"
        ></div>
        <div class="mb-3">
          <img
            :src="
              `https://api.adorable.io/avatars/100/${user.username}-${user.color}`
            "
          />
        </div>
        <div class="h5 mb-3">{{ user.username }}</div>

        <template v-if="user.lose">
          <button type="button" class="btn btn-danger btn-sm">
            Loser
          </button>
        </template>

        <template v-else-if="!isGamePlay">
          <button v-if="user.isReady" type="button" class="btn btn-dark btn-sm">
            User Ready
          </button>
          <button v-else type="button" class="btn btn-secondary btn-sm">
            User Is Not Ready
          </button>
        </template>

        <template v-else>
          <button
            v-if="userIndex === turnIndex"
            type="button"
            class="btn btn-success btn-sm"
          >
            {{
              user.username === username
                ? "Your Turn"
                : `${user.username}'s Turn`
            }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import ClipboardJS from 'clipboard'

export default {
  metaInfo: {
    title: 'Gameplay - Counter Bomber'
  },
  data () {
    return {
      timer: 0,
      bombTimer: 0,
      bombInterval: null,
      punchLeft: 0,
      isGameFinish: false
    }
  },
  computed: {
    lastMessage () {
      return this.$store.state.socket.lastMessage
    },
    isConnected () {
      return this.$store.state.socket.isConnected
    },
    room () {
      return this.$store.state.room
    },
    username () {
      return this.$store.state.username
    },
    participant () {
      return this.$store.state.participant
    },
    availableParticipant () {
      return this.participant.filter(val => !val.lose)
    },
    availableParticipantReady () {
      return (
        this.availableParticipant.length > 1 &&
        this.availableParticipant.every(val => val.isReady)
      )
    },
    bombCount () {
      return this.$store.state.bombCount
    },
    punchCount () {
      return this.$store.state.punchCount
    },
    bombLeft () {
      return this.bombCount - this.punchCount
    },
    canThrow: {
      get () {
        return this.$store.state.canThrow
      },
      set (val) {
        this.$store.commit('updateCanThrow', val)
      }
    },
    isGamePlay: {
      get () {
        return this.$store.state.isGamePlay
      },
      set (val) {
        this.$store.commit('updateIsGamePlay', val)
      }
    },
    turnIndex: {
      get () {
        return this.$store.state.turnIndex
      },
      set (val) {
        this.$store.commit('updateTurnIndex', val)
      }
    },
    isMyTurn () {
      const userIndex = this.participant.findIndex(val => {
        return val.username === this.username
      })

      return this.turnIndex === userIndex && this.isGamePlay
    },
    isMyUserReady () {
      const user = this.participant.find(val => {
        return val.username === this.username
      })

      return user.isReady || false
    }
  },
  watch: {
    isMyTurn: {
      handler () {
        clearInterval(this.bombInterval)
        this.bombTimer = 0

        if (this.isMyTurn) {
          this.bombTimer = 10

          this.bombInterval = setInterval(() => {
            if (this.bombTimer > 0) {
              this.bombTimer -= 1

              if (this.bombTimer <= 0) {
                clearInterval(this.bombInterval)

                if (this.isMyTurn) {
                  this.$socket.sendObj({
                    lose: true
                  })
                }
              }
            }
          }, 1000)
        }
      },
      immediate: true
    },
    isConnected: {
      handler () {
        if (!this.isConnected) {
          this.$router.push({ name: 'Join' })
        }
      },
      immediate: true
    },
    room: {
      handler () {
        if (!this.room) {
          this.$router.push({ name: 'Join' })
        }
      },
      immediate: true
    },
    lastMessage: {
      handler () {
        if (this.lastMessage.code === 20005) {
          this.init()
        }
      },
      deep: true
    },
    availableParticipant () {
      if (
        this.availableParticipant.length < this.participant.length &&
        this.availableParticipant.length <= 1
      ) {
        this.isGameFinish = true
      }
    },
    availableParticipantReady () {
      if (
        this.availableParticipant.length > 1 &&
        this.availableParticipantReady &&
        !this.isGameFinish
      ) {
        const timer = setInterval(() => {
          if (this.timer > 0) {
            this.timer -= 1

            if (this.timer <= 0) {
              clearInterval(timer)
              this.isGamePlay = true
            }
          }
        }, 1000)
      }
    },
    bombLeft () {
      if (this.isMyTurn) {
        if (this.bombLeft <= 0) {
          this.$socket.sendObj({
            lose: true
          })
        } else if (this.punchLeft <= 0) {
          this.nextTurn()
        }
      }
    }
  },
  mounted () {
    new ClipboardJS(".clipboard"); // eslint-disable-line
    this.init()
  },
  methods: {
    init () {
      this.isGamePlay = false
      this.timer = 5
      this.punchLeft = 3

      this.nextTurn()
    },
    toggleReady (val) {
      this.$socket.sendObj({
        ready: !val
      })
    },
    punch () {
      this.canThrow = true
      this.punchLeft -= 1

      this.$socket.sendObj({
        punch: true
      })
    },
    nextTurn () {
      const participantLength = this.participant.length
      let index = 0

      if (this.turnIndex < participantLength - 1) {
        index = this.turnIndex + 1
      }

      this.turnIndex = index

      if (
        this.participant.length > 0 &&
        this.participant[this.turnIndex].lose
      ) {
        this.nextTurn()
        return
      }

      this.$socket.sendObj({
        nextTurn: {
          index: this.turnIndex
        }
      })

      this.canThrow = false
      this.punchLeft = 3
    }
  }
}
</script>

<style lang="scss">
.main-section {
  min-height: 150px;
}

.h-25px {
  height: 25px;
}

.overlay {
  display: none;
  z-index: 10000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  align-content: center;
  background-color: #ffffffdd;

  &.show {
    display: flex !important;
    flex-wrap: wrap;
  }

  h1 {
    width: 100%;
  }
}

.participant {
  height: 240px;
}

.counter {
  font-size: 50px;
}
</style>
