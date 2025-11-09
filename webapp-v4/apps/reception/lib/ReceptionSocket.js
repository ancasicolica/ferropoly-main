/**
 * The socket for the reception
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.11.2025
 **/
import {FerropolySocket} from '../../../lib/FerropolySocket';
import {useReceptionStore} from '../store/ReceptionStore';

let socket = null;

class ReceptionSocket {
  constructor() {
    this.socket = null;
    this.receptionStore = useReceptionStore();
  }

  initSocket(options) {
    this.socket = new FerropolySocket(options);

    this.socket.on('connected', ()=> {
      this.receptionStore.socketConnected = true;
      console.log('connected');
    })
    this.socket.on('disconnected', ()=> {
      this.receptionStore.socketConnected = false;
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
