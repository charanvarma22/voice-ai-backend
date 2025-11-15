import apn from 'apn';
import { env } from '../config/env.js';
import { supabaseServiceClient } from './supabase.js';

let apnProvider: apn.Provider | null = null;

// Initialize APNs provider
export function initAPNs() {
  if (!env.APNS_KEY_ID || !env.APNS_TEAM_ID || !env.APNS_BUNDLE_ID) {
    // eslint-disable-next-line no-console
    console.warn('APNs not configured - push notifications disabled');
    return;
  }

  apnProvider = new apn.Provider({
    token: {
      key: env.APNS_KEY_ID || '',
      keyId: env.APNS_KEY_ID || '',
      teamId: env.APNS_TEAM_ID || ''
    },
    production: process.env.NODE_ENV === 'production'
  });
}

// Send push notification to user
export async function sendPushNotification(userId: string, title: string, body: string, data?: Record<string, any>) {
  if (!apnProvider) {
    // eslint-disable-next-line no-console
    console.warn('APNs not initialized');
    return;
  }

  const { data: devices } = await supabaseServiceClient
    .from('devices')
    .select('device_token')
    .eq('user_id', userId)
    .eq('platform', 'ios');

  if (!devices || devices.length === 0) return;

  const notification = new apn.Notification();
  notification.alert = { title, body };
  notification.sound = 'default';
  notification.badge = 1;
  notification.payload = data || {};
  notification.topic = env.APNS_BUNDLE_ID || '';

  const tokens = devices.map(d => d.device_token);
  const result = await apnProvider.send(notification, tokens);

  // eslint-disable-next-line no-console
  console.log('Push sent:', result);
  return result;
}

// Send VoIP push (for incoming calls)
export async function sendVoIPPush(userId: string, callSid: string, callerNumber: string) {
  if (!apnProvider) return;

  const { data: devices } = await supabaseServiceClient
    .from('devices')
    .select('device_token')
    .eq('user_id', userId)
    .eq('platform', 'ios');

  if (!devices || devices.length === 0) return;

  const notification = new apn.Notification();
  notification.alert = { body: `Incoming call from ${callerNumber}` };
  notification.sound = 'default';
  notification.payload = {
    type: 'voip',
    callSid,
    callerNumber
  };
  notification.topic = `${env.APNS_BUNDLE_ID || ''}.voip`;

  const tokens = devices.map(d => d.device_token);
  await apnProvider.send(notification, tokens);
}
