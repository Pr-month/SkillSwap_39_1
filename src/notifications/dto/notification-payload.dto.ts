export class NotificationPayloadDto {
  type: 'new_request' | 'request_accepted' | 'request_rejected';
  skillTitle: string;
  fromUser: {
    id: string;
    name: string;
  };
};