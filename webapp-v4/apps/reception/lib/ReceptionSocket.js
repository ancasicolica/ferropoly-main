/**
 * The socket for the reception
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.11.2025
 **/
import {FerropolySocket} from '../../../lib/FerropolySocket';
import {useSocketStore} from '../../../lib/store/SocketStore';

let socket = null;

class ReceptionSocket {
  constructor() {
    this.socket = null;
    this.socketStore = useSocketStore();
  }

  initSocket(options) {
    this.socket = new FerropolySocket(options);

    this.socket.on('connected', ()=> {
      this.socketStore.connected = true;
      console.log('connected');
    })
    this.socket.on('disconnected', ()=> {
      this.socketStore.connected = false;
      console.log('disconnected');
    })
  }
}

function getReceptionSocket() {
  if (!socket) {
    socket = new ReceptionSocket();
  }
  return socket;
}

export {getReceptionSocket}
