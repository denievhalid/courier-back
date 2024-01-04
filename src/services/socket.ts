import { socket } from "@/middlewares/socket";
import { SocketEvents } from "@/const";
import _ from "lodash";

type EmitBatchProps = {
  data: any;
  event: SocketEvents;
  room: string;
};

export class SocketService {
  static emit(event: SocketEvents, room: string, data: any) {
    socket.to(room).emit(event, data);
  }

  static emitBatch(data: EmitBatchProps[]) {
    _.forEach(data, ({ data, event, room }) => {
      this.emit(event, room, data);
    });
  }
}
