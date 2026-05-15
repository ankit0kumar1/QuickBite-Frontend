import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_BASE_URL =
  process.env.REACT_APP_DELIVERY_WS_BASE_URL ||
  process.env.REACT_APP_DELIVERY_SERVICE_URL ||
  'http://localhost:8089';

export const connectToOrderTracking = (orderId, onMessage) => {
  const client = new Client({
    reconnectDelay: 4000,
    webSocketFactory: () =>
      new SockJS(`${WS_BASE_URL}/ws/delivery-tracking`),
  });

  client.onConnect = () => {
    client.subscribe(`/topic/orders/${orderId}/tracking`, (message) => {
      try {
        onMessage(JSON.parse(message.body));
      } catch (error) {
        console.error('Failed to parse tracking message', error);
      }
    });
  };

  client.onStompError = (frame) => {
    console.error('Tracking socket error', frame);
  };

  client.activate();
  return client;
};
