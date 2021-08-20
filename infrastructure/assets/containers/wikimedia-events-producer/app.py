import os
import json

import boto3
from sseclient import SSEClient as EventSource

ssm_client = boto3.client('ssm')
firehose_client = boto3.client('firehose')

wikimedia_events_url = 'https://stream.wikimedia.org/v2/stream/recentchange'
delivery_stream_name = os.getenv('DELIVERY_STREAM_NAME')

def main():
    for event in EventSource(wikimedia_events_url):
        if event.event == 'message':
            try:
                data = json.loads(event.data)
            except ValueError:
                pass
            else:
                firehose_client.put_record(
                    DeliveryStreamName=delivery_stream_name, 
                    Record={
                        'Data': event.data.encode('utf-8')
                    })


if __name__ == "__main__":
    main()