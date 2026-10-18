import { Topic } from '../coreJava';

export const springDeadLetterTopic: Topic = {
    id: 'sb-dead-letter-topic',
    name: "Dead Letter Topic",
    beginner: [
        {
            content: `<h3>Dead Letter Topic</h3>
This topic is being written and will be published shortly.<br><br>

In the meantime, the surrounding module already covers the ground it sits on - work through the topics either side of it and come back once this one is live.`
        }
    ]
};
