import outspeed as sp
import ssl
import certifi

ssl_context = ssl.create_default_context(cafile=certifi.where())
# Use ssl_context in your HTTPS requests or library configuration

"""
The @outspeed.App() decorator is used to wrap the VoiceBot class.
This tells the outspeed server which functions to run.
"""
@sp.App()
class VoiceBot:
    async def setup(self) -> None:
        # Initialize the AI services
        self.rt_node = sp.OpenAIRealtime()

    @sp.streaming_endpoint()
    async def run(self, audio_input_queue: sp.AudioStream, text_input_queue: sp.TextStream):
        sp.map(text_input_queue.clone(), lambda x : print(x))
        # Set up the AI service pipeline
        audio_output_stream: sp.AudioStream
        audio_output_stream, text_output_stream = self.rt_node.run(text_input_queue, audio_input_queue)

        return audio_output_stream, text_output_stream

    async def teardown(self) -> None:
        # Close the OpenAI Realtime node when the application is shutting down
        await self.rt_node.close()



if __name__ == "__main__":
    # Start the VoiceBot when the script is run directly
    VoiceBot().start()