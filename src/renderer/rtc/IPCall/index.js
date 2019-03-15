import Vue from 'vue';
import { UA, SocketInterface, Call as Channel } from 'apollosip';
import { setupEventHandlers, removeEventHandlers, arrayfy, defer } from '../Utils';

let net;
let dgram;

try {
  net = require('net');
}
catch (e) { }
try {
  dgram = require('dgram');
}
catch (e) { }

export default Vue.extend({
  data() {
    return {
      ua        : null,
      port      : 5060,
      tcpServer : null,
      udpServer : null,
    };
  },

  computed : {
    account() {
      return this.$root.account;
    },
    call() {
      return this.$root.call;
    },
  },

  methods : {
    genUA(type = 'tcp') {
      return new UA({
        uri                  : 'sip:anonymous@anonymous.invalid',
        display_name         : 'Apollo VC',
        servers              : `${type}://dummy:5060`,
        register             : false,
        debug                : true,
        client_info          : 'Apollo_WebRTC',
        user_agent           : 'Yealink SIP-WEB',
        check_ruri           : false,
        DtlsSrtpKeyAgreement : false,
        rtcpMuxPolicy        : 'negotiate',
      });
    },

    prepareUA(con, type = 'tcp') {
      const ua = this.genUA(type);
      const socket = SocketInterface.Create({
        server : `${type}://dummy:${this.port}`,
      });

      socket.attach(con);

      ua.transport._setSocket({ socket });
      ua.transport._getSocket();
      ua.transport.connect();
      ua.transport._onConnect();

      const handlers = {
        newRTCSession : (data) => {
          if (data.originator !== 'remote') return;

          const channel = new Channel(ua);

          channel._isVue = true;
          channel.session = data.session;
          this.account.newChannel.push(channel);

          const listeners = {
            finished : () => {
              const index = this.account.newChannel.indexOf(channel);

              this.account.newChannel.splice(index, 1);
              removeEventHandlers(channel, listeners);
              if (type === 'tcp') ua.stop();
            },
            failed : () => {
              const index = this.account.newChannel.indexOf(channel);

              this.account.newChannel.splice(index, 1);
              removeEventHandlers(channel, listeners);
              if (type === 'tcp') ua.stop();
            },
          };

          setupEventHandlers(channel, listeners);
        },
      };

      setupEventHandlers(ua, handlers);

      return ua;
    },

    connect(host) {
      // current socket
      const socket = this.ua.transport.socket;

      socket._options.host = host;

      const originalChannel = this.call.channel;

      const channel = new Channel(this.ua);

      channel.target = host;
      channel._isVue = true;

      const listeners = {
        finished : () => {
          this.call.channel = originalChannel;
          removeEventHandlers(channel, listeners);
        },
        failed : () => {
          this.call.channel = originalChannel;
          removeEventHandlers(channel, listeners);
        },
      };

      setupEventHandlers(channel, listeners);

      // wrap channel
      this.call.channel = channel;

      // connect
      return this.call.connect();
    },
    disconnect() {
      return this.call.disconnect();
    },
  },

  created() {
    // prepare tcp
    if (net) {
      const tcpServer = net.createServer();

      tcpServer.listen(this.port);
      tcpServer.on('error', () => tcpServer.close());
      tcpServer.on('connection', (con) => this.prepareUA(con, 'tcp'));

      this.tcpServer = tcpServer;
    }

    // prepare udp
    if (dgram) {
      const udpServer = dgram.createSocket('udp4');

      udpServer.bind(this.port);

      this.udpServer = udpServer;
    
      this.ua = this.prepareUA(udpServer, 'udp');
    }
  },

  destroyed() {
    if (this.tcpServer) {
      this.tcpServer.close();
    }
    if (this.udpServer) {
      this.udpServer.close();
    }
    if (this.ua) {
      this.ua.stop();
    }
  },
});
