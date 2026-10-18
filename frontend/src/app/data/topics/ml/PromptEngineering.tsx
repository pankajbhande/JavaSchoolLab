import { Topic } from '../../coreJava';

export const promptEngineering: Topic = {
    id: 'ml-genai-prompt-engineering',
    name: 'Prompt Engineering',
    beginner: [
        {
            content: `<h4>Getting Better Answers Out of the Same Model, Just by Asking Better</h4>
<ul>
<li><strong>Prompt Engineering</strong> is the practice of carefully designing the input text (the <strong>prompt</strong>) sent to a Large Language Model (LLM) to reliably get the output you actually want - without changing the model's weights at all.</li>
<li>The same underlying model can produce a vague, badly-formatted, or wrong answer to a lazy one-line prompt, and a precise, structured, correct answer to a well-engineered prompt - because an LLM generates text by predicting what's statistically likely to follow the prompt it was GIVEN, so the prompt itself is the main lever you control.</li>
<li>Two foundational styles: <strong>zero-shot prompting</strong> (just ask the question directly, with no examples) versus <strong>few-shot prompting</strong> (show the model 2-3 example input/output pairs INSIDE the prompt before asking it to do the same thing on a new input) - few-shot dramatically improves consistency for tasks with a specific expected format.</li>
</ul>`,
            codeExamples: [
                `# Zero-shot vs few-shot prompting for a structured extraction task (pseudocode LLM call)
def call_llm(prompt):
    # Placeholder for a real call, e.g. client.messages.create(model="claude-...", messages=[...])
    # Returned text below is illustrative of typical model behavior for each prompt style.
    if "Example 1" in prompt:
        return '{"product": "wireless mouse", "issue": "battery drains in 2 days", "urgency": "medium"}'
    return "The customer is unhappy about their wireless mouse because the battery only lasts 2 days."

support_ticket = "My wireless mouse battery drains in 2 days, please help, this is annoying."

# --- Zero-shot: just ask directly, no examples, no format instructions ---
zero_shot_prompt = f"Extract the key info from this support ticket: {support_ticket}"
print("Zero-shot output:")
print(call_llm(zero_shot_prompt))

# --- Few-shot: show the model the exact input/output pattern to imitate ---
few_shot_prompt = f"""Extract structured fields from support tickets as JSON.

Example 1:
Ticket: "My laptop screen flickers randomly, need this fixed ASAP."
Output: {{"product": "laptop", "issue": "screen flickers randomly", "urgency": "high"}}

Example 2:
Ticket: "The app crashes once a week, not a huge deal but annoying."
Output: {{"product": "app", "issue": "crashes weekly", "urgency": "low"}}

Now extract the same fields from this ticket:
Ticket: "{support_ticket}"
Output:"""
print("\\nFew-shot output:")
print(call_llm(few_shot_prompt))
# OUTPUT (typical):
# Zero-shot output:
# The customer is unhappy about their wireless mouse because the battery only lasts 2 days.
#
# Few-shot output:
# {"product": "wireless mouse", "issue": "battery drains in 2 days", "urgency": "medium"}`
            ],
            codeExplanations: [
                `This contrasts the two most basic prompting styles on the same underlying task: turning a raw customer support ticket into structured data. The zero-shot prompt simply asks the model to "extract the key info" with no guidance on format, and a real LLM will often respond with a free-form sentence summary - plausible-sounding, but not something a downstream program can reliably parse into a database record. The few-shot prompt instead shows the model two complete worked examples of tickets converted into a consistent JSON shape (with the same three keys: product, issue, urgency) before handing it the real ticket to process - the model pattern-matches onto the demonstrated structure and returns JSON in exactly the same shape, which is dramatically easier to parse programmatically. Note that neither prompt changed the model itself in any way; the entire difference in output quality and format came purely from how the prompt was engineered, which is the core insight behind prompt engineering as a discipline.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Why This Matters</h3>
<ul>
<li>Without deliberate prompt design, LLM output is inconsistent and unpredictable in production - the exact same underlying question phrased slightly differently, or without an explicit output format, can produce wildly different response structures, making it nearly impossible to build reliable software (a UI, an API, a downstream pipeline) on top of raw LLM output.</li>
<li>Prompt engineering is usually the CHEAPEST and FASTEST lever available to improve LLM behavior. <strong>Fine-tuning</strong> a model requires curating a labeled training dataset, running an actual training job (compute cost, time - often hours to days), evaluating the result, and redeploying a new model version - and even then fine-tuning is generally better at teaching STYLE/tone/format than at reliably injecting new facts. A prompt change, by contrast, can be tested and deployed in minutes with zero training cost, which is why teams almost always try prompt engineering (and RAG, for missing knowledge) before reaching for fine-tuning.</li>
<li>Badly engineered prompts silently cost real money and quality at scale: a vague prompt that needs the user to ask a follow-up question to get a usable answer doubles the number of API calls (and the latency the end user experiences) for the same underlying task, and inconsistent output formatting causes downstream parsing failures that are hard to debug because the failure is probabilistic, not a deterministic code bug.</li>
</ul>
<h3>System vs User Prompts</h3>
<ul>
<li>Most production LLM APIs distinguish a <strong>system prompt</strong> (sets the model's persistent role, tone, constraints, and behavior for the entire conversation - e.g. "You are a support agent for Acme Corp. Only answer questions about Acme products. Always respond in JSON.") from the <strong>user prompt</strong> (the specific, per-turn question or request).</li>
<li>Putting stable instructions in the system prompt (role, output format, constraints, what NOT to do) and leaving only the variable, per-request content in the user prompt keeps behavior consistent across many different user inputs and is easier to test and version than re-stating instructions in every user message.</li>
</ul>`,
            codeExamples: [
                `# System prompt (stable role + rules) vs user prompt (the variable request) for a support bot
def call_llm(system_prompt, user_prompt):
    # Placeholder for a real chat-completion call passing separate system/user roles
    return ('{"answer": "Please try re-pairing the mouse via Settings > Bluetooth, '
            'and if that fails we can send a replacement.", "escalate": false}')

system_prompt = """You are a customer support assistant for Acme Electronics.
Rules:
- Only answer questions about Acme products; if asked about anything else, politely decline.
- Always respond as JSON with exactly two fields: "answer" (string) and "escalate" (boolean).
- Set "escalate" to true only if the customer explicitly asks for a refund or mentions safety."""

user_prompt_1 = "My wireless mouse won't connect via Bluetooth anymore."
response_1 = call_llm(system_prompt, user_prompt_1)
print("Response 1:", response_1)

# The SAME system prompt (rules never change) is reused across every new user turn -
# only the user_prompt varies per request, keeping behavior consistent.
user_prompt_2 = "What's the capital of France?"
def call_llm_offtopic(system_prompt, user_prompt):
    return '{"answer": "I can only help with questions about Acme Electronics products.", "escalate": false}'
response_2 = call_llm_offtopic(system_prompt, user_prompt_2)
print("Response 2:", response_2)
# OUTPUT (typical):
# Response 1: {"answer": "Please try re-pairing the mouse via Settings > Bluetooth, and if that fails we can send a replacement.", "escalate": false}
# Response 2: {"answer": "I can only help with questions about Acme Electronics products.", "escalate": false}`
            ],
            codeExplanations: [
                `This shows why splitting instructions into a system prompt versus a user prompt matters in a real application. The system_prompt is written ONCE and holds everything that should stay constant no matter what the customer asks: the assistant's role, the required JSON output shape, and explicit rules about scope (only Acme products) and escalation. Two different user prompts are then run against that same fixed system prompt - a legitimate product question and a clearly off-topic question - and because the rules live in the system prompt rather than being re-typed per request, the model consistently enforces them in both cases: it answers the real product question helpfully in the exact required format, and it declines the off-topic question while still honoring the same JSON structure. In a real production system, this separation also means the engineering team can update behavior (add a rule, change the output schema) in exactly one place - the system prompt - without having to change how every individual user request is constructed.`
            ]
        },
        {
            content: `<h3>Chain-of-Thought Prompting</h3>
<ul>
<li><strong>Chain-of-thought (CoT) prompting</strong> asks the model to work through a problem step by step BEFORE giving its final answer (e.g. by adding "think step by step" or by showing few-shot examples that include the reasoning steps, not just the final answer) - this measurably improves accuracy on tasks that require multi-step reasoning, like arithmetic word problems, logic puzzles, or multi-step planning.</li>
<li>The mechanism: an LLM generates its answer token by token, left to right, with no ability to "go back and rethink" once a token is committed. If it's forced to jump straight to a final answer on a hard multi-step problem, an early wrong assumption baked into the first few tokens can't be corrected. Making it externalize intermediate reasoning steps as text gives it a scratchpad to work through the logic, which measurably reduces errors on problems that need more than one inferential step.</li>
<li>This is directly relevant in production: for a task like "should this loan application be approved," a chain-of-thought prompt that walks through income, debt ratio, and credit history one at a time before concluding is both more accurate AND more explainable than a prompt that demands a bare yes/no with no shown reasoning.</li>
</ul>`,
            codeExamples: [
                `# Comparing a direct-answer prompt to a chain-of-thought prompt on a multi-step reasoning task
def call_llm(prompt):
    if "step by step" in prompt.lower():
        return (
            "Step 1: Sarah starts with 5 boxes, each with 8 apples = 40 apples.\\n"
            "Step 2: She gives away 3 boxes = 3 * 8 = 24 apples given away.\\n"
            "Step 3: Remaining apples = 40 - 24 = 16.\\n"
            "Step 4: She then buys 2 more boxes = 2 * 8 = 16 new apples.\\n"
            "Step 5: Total = 16 + 16 = 32.\\n"
            "Final answer: 32 apples"
        )
    return "Final answer: 24 apples"  # a direct-answer prompt more often skips a step and gets this wrong

question = ("Sarah has 5 boxes with 8 apples each. She gives away 3 boxes, "
            "then buys 2 more boxes of 8 apples. How many apples does she have now?")

direct_prompt = f"Answer this question: {question}"
print("Direct-answer prompt result:")
print(call_llm(direct_prompt))

cot_prompt = f"Answer this question, thinking step by step before giving your final answer: {question}"
print("\\nChain-of-thought prompt result:")
print(call_llm(cot_prompt))
# OUTPUT (typical):
# Direct-answer prompt result:
# Final answer: 24 apples
#
# Chain-of-thought prompt result:
# Step 1: Sarah starts with 5 boxes, each with 8 apples = 40 apples.
# Step 2: She gives away 3 boxes = 3 * 8 = 24 apples given away.
# Step 3: Remaining apples = 40 - 24 = 16.
# Step 4: She then buys 2 more boxes = 2 * 8 = 16 new apples.
# Step 5: Total = 16 + 16 = 32.
# Final answer: 32 apples`
            ],
            codeExplanations: [
                `This illustrates why forcing a model to externalize its reasoning changes accuracy on a multi-step arithmetic word problem, which requires tracking several intermediate quantities (starting apples, apples given away, apples remaining, apples added) correctly in sequence. The direct-answer prompt asks for the answer immediately, and because the model generates its response token by token with no scratchpad, it's simulated here as landing on a plausible-looking but wrong intermediate shortcut ("24 apples," stopping after just the giveaway step and forgetting the purchase step). The chain-of-thought prompt instead explicitly instructs the model to work "step by step," and the response walks through each arithmetic operation as its own explicit line before stating a final answer - each step's output becomes available as context for the next step, which is what lets the model correctly chain all four operations together to reach 32. In a real production system, this same technique - and its explicit intermediate steps - also doubles as a lightweight explainability trail: a reviewer (or an automated check) can inspect WHERE in the reasoning chain something went wrong, which a bare final-answer response would never reveal.`
            ]
        },
        {
            content: `<h3>Real-World Example</h3>
<ul>
<li>A customer-support team wires an LLM into their helpdesk to auto-draft first-response replies to incoming tickets. Their FIRST attempt uses a bare one-line prompt: <code>"Reply to this customer ticket: {ticket_text}"</code> - and gets back replies with wildly inconsistent tone (sometimes overly casual, sometimes robotic), no consistent structure, and occasional replies that promise things the company can't actually do (e.g. instant refunds), because the model was never told what it's allowed to promise.</li>
<li>After engineering the prompt - a system prompt defining the support agent persona, company policy constraints ("never promise a refund timeline faster than 5 business days," "always include a ticket reference number"), a required output format, and 2-3 few-shot examples of ideal replies to similar past tickets - the SAME underlying model produces replies that are on-brand, policy-compliant, and consistently structured, with zero change to the model itself.</li>
<li>The team measured this directly: with the bare prompt, roughly 1 in 4 auto-drafted replies needed a human agent to substantially rewrite it before sending; after prompt engineering, that fell to roughly 1 in 20 - a meaningful production quality jump achieved entirely through prompt design, with no fine-tuning and no new model.</li>
</ul>`,
            codeExamples: [
                `# Before/after: a bare prompt vs an engineered prompt (role + constraints + format + few-shot) for the same ticket
def call_llm(prompt):
    if "Policy constraints" in prompt:
        return ('{"reply": "Hi Alex, thanks for reaching out - I\\'m sorry about the delayed shipment. '
                'I have escalated this and you should receive tracking within 2 business days. '
                'Reference: TCK-48213.", "needs_human_review": false}')
    return "hey no worries we will refund you right now dont even worry about it!"

ticket = "My order #48213 hasn't shipped in 9 days and I'm getting worried, this is my first order with you."

bare_prompt = f"Reply to this customer ticket: {ticket}"
print("Bare prompt reply:")
print(call_llm(bare_prompt))

engineered_prompt = f"""You are a customer support agent for Acme Retail. Respond warmly and professionally.

Policy constraints:
- Never promise a refund without checking the order status first.
- Always include the ticket reference number in the reply.
- Keep replies under 60 words.
- Respond as JSON: {{"reply": "...", "needs_human_review": true/false}}

Example ticket: "My package says delivered but I never got it. Ticket #10021."
Example reply: {{"reply": "Hi, I'm sorry to hear that - I've flagged this as a lost package and started an "
                "investigation with the carrier. You'll hear back within 2 business days. Reference: TCK-10021.", "needs_human_review": false}}

Now handle this ticket:
"{ticket}"
"""
print("\\nEngineered prompt reply:")
print(call_llm(engineered_prompt))
# OUTPUT (typical):
# Bare prompt reply:
# hey no worries we will refund you right now dont even worry about it!
#
# Engineered prompt reply:
# {"reply": "Hi Alex, thanks for reaching out - I'm sorry about the delayed shipment. I have escalated this and you should receive tracking within 2 business days. Reference: TCK-48213.", "needs_human_review": false}`
            ],
            codeExplanations: [
                `This reconstructs the support-team scenario directly: the same underlying ticket is sent through a bare one-line prompt and through a fully engineered prompt, and the difference in output quality is stark. The bare prompt gives the model no role, no policy, and no format, so it free-associates a casual reply that promises an instant refund - something the company may not actually be able to honor, and a real liability if sent to a customer automatically. The engineered prompt supplies a system-style role and tone instruction, explicit policy constraints (don't promise a refund without checking status, always include the ticket reference, stay under 60 words), a required JSON output shape so the reply can be inserted into the helpdesk UI programmatically, and one few-shot example demonstrating the exact desired reply style for a similar situation. The resulting reply is policy-compliant, includes the required reference number, and is safely structured as JSON with a needs_human_review flag a real system could branch on - all from prompt design changes alone, with the underlying LLM completely unchanged.`
            ]
        },
        {
            content: `<h3>Advantages</h3>
<ul>
<li><strong>Fast and cheap to iterate</strong> - a prompt change can be tested and deployed in minutes with no training run, no GPU cost, and no redeployment of a new model artifact, versus fine-tuning which needs a curated dataset, a training job, and evaluation before it can ship.</li>
<li><strong>No risk of catastrophic forgetting</strong> - fine-tuning a model on narrow new examples can degrade its general capabilities elsewhere (a known failure mode called catastrophic forgetting); prompt engineering never touches the model's weights, so its broad general capabilities stay fully intact alongside the improved behavior for your specific task.</li>
<li><strong>Transparent and debuggable</strong> - a prompt is plain, readable text that any engineer (or non-engineer) on the team can inspect, review, and version in source control, unlike a fine-tuned model's weights, which are an opaque artifact that can't be "read" to understand why it behaves a certain way.</li>
</ul>
<h3>Disadvantages / Limitations</h3>
<ul>
<li><strong>Ceiling on what it can fix</strong> - prompt engineering can't teach a model a genuinely NEW skill or inject large amounts of new factual knowledge it was never trained on; it can only better elicit capabilities the model already has latent in its training. For truly missing knowledge, <strong>RAG</strong> (retrieving relevant documents into the prompt) is the appropriate fix, not prompt wording alone.</li>
<li><strong>Consumes context window and cost</strong> - long system prompts, several few-shot examples, and chain-of-thought reasoning all add tokens to every single API call, which directly increases latency and per-request cost at scale, especially for high-volume production use cases.</li>
<li><strong>Fragile across model versions</strong> - a prompt carefully tuned against one model version's specific quirks can behave differently (sometimes worse) when the underlying model is upgraded, since different model versions can interpret the same instructions slightly differently - so prompts need re-testing whenever the underlying model changes, not "set once and forget."</li>
</ul>`,
            codeExamples: [
                `# Illustrating the cost/latency tradeoff of adding few-shot examples and CoT to every request
def estimate_tokens(text):
    return max(1, len(text) // 4)  # rough heuristic: ~4 characters per token

bare_prompt = "Classify the sentiment of this review: 'The battery life is disappointing.'"

few_shot_cot_prompt = """Classify review sentiment as positive, negative, or neutral.
Think step by step, then give the final label.

Example 1:
Review: "Fast shipping and the product works great!"
Reasoning: Mentions fast shipping (positive) and product working well (positive). No complaints.
Label: positive

Example 2:
Review: "It arrived on time but the packaging was a bit damaged."
Reasoning: On-time delivery is neutral/positive, but damaged packaging is a mild complaint. Mixed but leans neutral.
Label: neutral

Now classify:
Review: "The battery life is disappointing."
Reasoning:"""

bare_tokens = estimate_tokens(bare_prompt)
engineered_tokens = estimate_tokens(few_shot_cot_prompt)

print(f"Bare prompt:       ~{bare_tokens} tokens")
print(f"Few-shot+CoT prompt: ~{engineered_tokens} tokens")
print(f"Extra tokens per request: ~{engineered_tokens - bare_tokens} "
      f"({(engineered_tokens / bare_tokens):.1f}x the size)")
print("At high request volume, this token overhead directly multiplies API cost and adds latency.")
# OUTPUT (typical):
# Bare prompt:       ~19 tokens
# Few-shot+CoT prompt: ~145 tokens
# Extra tokens per request: ~126 (7.6x the size)
# At high request volume, this token overhead directly multiplies API cost and adds latency.`
            ],
            codeExplanations: [
                `This makes the "consumes context window and cost" limitation concrete rather than abstract, using a rough token-estimation heuristic (roughly 4 characters per token, close enough for illustration) to compare a bare classification prompt against the same task engineered with few-shot examples and chain-of-thought instructions. The bare prompt is short and cheap, but as shown elsewhere in this topic, less reliable and less consistently formatted. The engineered version is far more token-heavy - the two full worked examples plus their reasoning text and the explicit "think step by step" instruction all get sent as input tokens on EVERY single API call, not just once - and most LLM APIs charge per input and output token, so this overhead is a real, recurring cost multiplier. The final printed ratio (roughly 7-8x more tokens here) makes concrete why, at production scale (thousands or millions of requests), teams have to consciously balance prompt sophistication against the real latency and dollar cost of every extra token, rather than assuming "more examples and more reasoning is always free to add."`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between zero-shot and few-shot prompting, and when would you use each?</td><td>Zero-shot prompting asks the model to perform a task with no examples, relying purely on its instructions and trained-in knowledge; few-shot prompting includes 2-3 worked input/output example pairs directly in the prompt so the model can pattern-match the exact desired format and style. Few-shot is preferred when consistent structure/format matters (e.g. producing parseable JSON) or the task is unusual enough that instructions alone leave too much ambiguity; zero-shot is fine for simple, well-understood tasks where adding examples would just waste tokens and latency for no accuracy gain</td></tr>
<tr class='text-center'><td>Why does chain-of-thought prompting improve accuracy on multi-step reasoning tasks?</td><td>An LLM generates its response token by token, left to right, with no ability to revise earlier tokens once committed - if it jumps straight to a final answer on a problem requiring several dependent reasoning steps, an early wrong assumption can't be corrected. Explicitly prompting it to work through intermediate steps as visible text gives it a "scratchpad" where each step's output becomes context for the next, letting it correctly chain multi-step logic instead of pattern-matching straight to a plausible-but-wrong final answer</td></tr>
<tr class='text-center'><td>Why would a team try prompt engineering before fine-tuning a model for a new use case?</td><td>Prompt engineering requires no training data curation, no training run, no compute cost, and no redeployment - a prompt change can be tested and shipped in minutes and is fully reversible. Fine-tuning requires a labeled dataset, an actual training job, evaluation, and a new model artifact to deploy, and is generally better suited to teaching style/behavior than reliably injecting new facts - so it's usually reserved for cases where careful prompt design (and RAG, for missing knowledge) genuinely can't achieve the needed behavior</td></tr>
</table>`
        }
    ]
};
