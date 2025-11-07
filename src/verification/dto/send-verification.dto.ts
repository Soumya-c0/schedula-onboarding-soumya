export class SendVerificationDto {
  userId!: string;      // user id (uuid)
  method?: 'email' | 'sms'; // optional, default email
}
