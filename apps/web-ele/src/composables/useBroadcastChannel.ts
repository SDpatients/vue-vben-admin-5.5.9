import { ref, onMounted, onUnmounted } from 'vue';

interface BroadcastChannelMessage {
  type: string;
  data: any;
}

export function useBroadcastChannel(channelName: string) {
  const isSupported = ref(typeof window !== 'undefined' && 'BroadcastChannel' in window);
  const channel = ref<BroadcastChannel | null>(null);
  
  if (isSupported.value) {
    channel.value = new BroadcastChannel(channelName);
  }
  
  const send = (message: BroadcastChannelMessage) => {
    if (channel.value) {
      channel.value.postMessage(message);
    }
  };
  
  const onMessage = (callback: (event: MessageEvent<BroadcastChannelMessage>) => void) => {
    if (channel.value) {
      channel.value.addEventListener('message', callback);
      
      return () => {
        if (channel.value) {
          channel.value.removeEventListener('message', callback);
        }
      };
    }
    
    return () => {};
  };
  
  onUnmounted(() => {
    if (channel.value) {
      channel.value.close();
    }
  });
  
  return {
    isSupported,
    send,
    onMessage
  };
}
