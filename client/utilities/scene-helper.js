import { FADE_DURATION } from '../constants/config';
import { STOP } from '../../shared/constants/actions/player';

export const onChangeScene = (player, cameras) => {
    player.transition = true;
    player.socket.emit(STOP, { x: player.players[player.socket.id].x, y: player.players[player.socket.id].y });
    player.players[player.socket.id].anims.stop();
    cameras.main.fade(FADE_DURATION);
};
