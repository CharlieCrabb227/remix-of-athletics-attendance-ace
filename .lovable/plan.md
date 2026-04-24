
**WhatsApp Reminder System Implementation Plan:**

1. **Database Schema Updates**
   - Add phone number field to the profiles table 
   - Add WhatsApp preference settings for users
   - Create a WhatsApp reminders tracking table

2. **WhatsApp API Integration**
   - Set up WhatsApp Business API (via services like Twilio, Meta Business, or WhatsApp Cloud API)
   - Create a Supabase Edge Function to handle WhatsApp message sending
   - Implement message templates for game reminders

3. **User Profile Updates**
   - Add phone number input field to user account settings
   - Add WhatsApp opt-in/opt-out preferences
   - Validate phone number format and country codes

4. **Enhanced Reminder System**
   - Modify the existing reminder system to support both email AND WhatsApp
   - Allow admins to choose which channels to use for reminders (email, WhatsApp, or both)
   - Create WhatsApp-specific message templates with game details

5. **Admin Dashboard Enhancements**
   - Add WhatsApp reminder controls alongside email reminders
   - Show delivery status for both email and WhatsApp messages
   - Allow bulk WhatsApp messaging for urgent updates

6. **WhatsApp Message Features**
   - Game reminder messages with quick reply buttons for attendance
   - Beer duty assignment notifications
   - Last-minute game updates and cancellations
   - Integration with calendar links in WhatsApp messages

The WhatsApp integration would work alongside the email system, giving users multiple ways to stay informed about games and allowing admins to reach players through their preferred communication channel.
