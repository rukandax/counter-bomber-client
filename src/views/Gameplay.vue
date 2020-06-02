<template>
  <div class="container bg-white p-4 m-4">
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
        alt=""
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

    <div class="row m-0 mb-3">
      <div class="col-4 px-0">
        <div class="text-center mb-3">
          <span class="bom-count font-weight-bold">{{
            isGamePlay ? bombLeft : "??"
          }}</span>
          Punch(es) needed
        </div>
        <div class="px-5">
          <button
            type="button"
            class="btn btn-danger btn-sm btn-block mb-3"
            :disabled="!isGamePlay || !isMyTurn"
            @click="punch()"
          >
            <template v-if="availableParticipant.length <= 1">
              Waiting for Others
            </template>
            <template v-else-if="!isGamePlay">
              Please Set Ready
            </template>
            <template v-else> &gt;&gt; Punch Bomb ({{ punchLeft }} left) &lt;&lt;</template>
          </button>
          <button
            type="button"
            class="btn btn-warning btn-sm btn-block mb-3"
            :disabled="!isGamePlay || !isMyTurn || !canThrow"
            @click="nextTurn"
          >
            <template v-if="availableParticipant.length <= 1">
              Waiting for Others
            </template>
            <template v-else-if="!isGamePlay">
              Please Set Ready
            </template>
            <template v-else>
              &gt;&gt; Throw <span v-if="!canThrow">(1 Punch to Enable)</span> &lt;&lt;
            </template>
          </button>
        </div>
      </div>
      <div class="col-4 px-4 text-center">
        <div class="text-center mb-3">
          <span class="bom-count font-weight-bold">
            {{ isGamePlay ? bombTimer : "??" }}
          </span>
          Second(s) before explode
        </div>
        <div class="alert alert-success" role="alert">
          The rules is very simple, if the bomb explode on your turn, you lose
        </div>
      </div>
      <div class="col-4 p-4 bg-info text-white font-weight-bold">
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
        class="text-center col-6 col-lg-4 px-0 border participant"
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
        <div class="h5 mb-3">
          {{ user.username }}
        </div>

        <template v-if="user.lose">
          <button type="button" class="btn btn-danger btn-sm" disabled>
            Loser
          </button>
        </template>

        <template v-else-if="!isGamePlay">
          <button
            v-if="user.username === username"
            @click="toggleReady(user.isReady)"
            type="button"
            class="btn btn-sm"
            :class="{
              'btn-primary': !user.isReady,
              'btn-danger': user.isReady
            }"
            :disabled="
              availableParticipant.length <= 1 || availableParticipantReady
            "
          >
            <template v-if="availableParticipant.length <= 1">
              Waiting for Others
            </template>
            <template v-else>
              {{ user.isReady ? "Set Not Ready" : "&gt;&gt; Set Ready &lt;&lt;" }}
            </template>
          </button>

          <button
            v-else-if="user.isReady"
            type="button"
            class="btn btn-secondary btn-sm"
            disabled
          >
            User Ready
          </button>
        </template>

        <template v-else>
          <button
            v-if="userIndex === turnIndex"
            type="button"
            class="btn btn-success btn-sm"
            disabled
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
    }
  },
  watch: {
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
        const bombTimer = () =>
          setTimeout(() => {
            if (this.bombTimer > 0) {
              this.bombTimer -= 1
              bombTimer()

              if (this.bombTimer <= 0 && this.isMyTurn) {
                this.$socket.sendObj({
                  lose: true
                })
              }
            }
          }, 1000)

        const timer = () =>
          setTimeout(() => {
            if (this.timer > 0) {
              this.timer -= 1
              timer()

              if (this.timer <= 0) {
                this.isGamePlay = true
                this.bombTimer = (this.bombCount * 2) + (this.bombCount / 2)
                bombTimer()
              }
            }
          }, 1000)

        timer()
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

      if (this.participant[this.turnIndex].lose) {
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

.bom-count {
  font-size: 50px;
}
</style>
