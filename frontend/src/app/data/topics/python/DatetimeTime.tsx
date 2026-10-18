import type { Topic } from '../../types';

export const datetimeTime: Topic = {
    id: 'python-modules-packages-datetime-time',
    name: 'datetime & time',
    beginner: [
        {
            content: `<h4>The Four Main Types</h4>
The <code>datetime</code> module provides:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Holds</th><th>Java equivalent</th></tr>
<tr class='text-center'><td><code>date</code></td><td>Year, month, day</td><td><code>LocalDate</code></td></tr>
<tr class='text-center'><td><code>time</code></td><td>Hour, minute, second, microsecond</td><td><code>LocalTime</code></td></tr>
<tr class='text-center'><td><code>datetime</code></td><td>A date and a time together</td><td><code>LocalDateTime</code> / <code>ZonedDateTime</code></td></tr>
<tr class='text-center'><td><code>timedelta</code></td><td>A duration - the difference between two dates/times</td><td><code>Duration</code> / <code>Period</code></td></tr>
</table>`,
            codeExamples: [
                `from datetime import date, time, datetime

d = date(2026, 10, 4)
print(d, d.year, d.month, d.day)
print(d.weekday(), d.isoweekday())      # Monday = 0 / Monday = 1

t = time(18, 30)
print(t)

dt = datetime(2026, 10, 4, 18, 30)
print(dt, dt.date(), dt.time())

# OUTPUT:
# 2026-10-04 2026 10 4
# 6 7
# 18:30:00
# 2026-10-04 18:30:00 2026-10-04 18:30:00`
            ]
        },
        {
            content: `<h4>Today and Now</h4>
<code>date.today()</code> and <code>datetime.now()</code> read the system clock, so their output depends on when you run the code.`,
            codeExamples: [
                `from datetime import date, datetime

print(date.today())
print(datetime.now())

# OUTPUT (varies - e.g.):
# 2026-10-04
# 2026-10-04 18:30:12.483920`
            ]
        },
        {
            content: `<h4>Date Arithmetic with timedelta</h4>
Subtracting two dates gives a <code>timedelta</code>; adding a <code>timedelta</code> to a date moves it forward or back, handling month lengths and leap years for you.`,
            codeExamples: [
                `from datetime import date, timedelta

today = date(2026, 10, 4)
exam = date(2026, 12, 15)

left = exam - today
print(left, "|", left.days, "days to go")

due = today + timedelta(days=30)
print("Due:", due)
print("A week ago:", today - timedelta(weeks=1))
print(today < exam, max(today, exam))

# OUTPUT:
# 72 days, 0:00:00 | 72 days to go
# Due: 2026-11-03
# A week ago: 2026-09-27
# True 2026-12-15`
            ]
        },
        {
            content: `<h4>Calculating Age Correctly</h4>
Dividing the number of days by 365 ignores leap days and birthdays that haven't happened yet this year. Compare years, then subtract one if the birthday is still ahead.`,
            codeExamples: [
                `from datetime import date

born = date(2000, 10, 5)
today = date(2026, 10, 4)          # birthday is tomorrow

wrong = (today - born).days // 365
right = today.year - born.year - ((today.month, today.day) < (born.month, born.day))

print((today - born).days, wrong, right)

# OUTPUT:
# 9495 26 25`
            ]
        },
        {
            content: `<h4>Formatting with strftime()</h4>
<code>strftime</code> ("string format time") turns a date or datetime into text using format codes.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Code</th><th>Meaning</th><th>Example</th></tr>
<tr class='text-center'><td><code>%d</code></td><td>Day, 2 digits</td><td>04</td></tr>
<tr class='text-center'><td><code>%m</code></td><td>Month, 2 digits</td><td>10</td></tr>
<tr class='text-center'><td><code>%Y</code></td><td>Year, 4 digits</td><td>2026</td></tr>
<tr class='text-center'><td><code>%H</code> / <code>%I</code></td><td>Hour (24-hour / 12-hour)</td><td>18 / 06</td></tr>
<tr class='text-center'><td><code>%M</code></td><td>Minute</td><td>30</td></tr>
<tr class='text-center'><td><code>%S</code></td><td>Second</td><td>00</td></tr>
<tr class='text-center'><td><code>%p</code></td><td>AM / PM</td><td>PM</td></tr>
<tr class='text-center'><td><code>%A</code> / <code>%a</code></td><td>Weekday name / short</td><td>Sunday / Sun</td></tr>
<tr class='text-center'><td><code>%B</code> / <code>%b</code></td><td>Month name / short</td><td>October / Oct</td></tr>
</table>`,
            codeExamples: [
                `from datetime import datetime

dt = datetime(2026, 10, 4, 18, 30)

print(dt.strftime("%d/%m/%Y"))
print(dt.strftime("%d-%b-%Y %I:%M %p"))
print(dt.strftime("%A, %d %B %Y"))
print(f"{dt:%H:%M}")                    # format codes also work in f-strings

# OUTPUT:
# 04/10/2026
# 04-Oct-2026 06:30 PM
# Sunday, 04 October 2026
# 18:30`
            ]
        },
        {
            content: `<h4>Parsing with strptime()</h4>
<code>strptime</code> ("string parse time") does the reverse: text plus a format becomes a <code>datetime</code>. The text must match the format exactly.`,
            codeExamples: [
                `from datetime import datetime

start = datetime.strptime("15-08-2026 09:00", "%d-%m-%Y %H:%M")
print(start, type(start))

print(datetime.strptime("2026/08/15", "%d-%m-%Y"))

# OUTPUT:
# 2026-08-15 09:00:00 <class 'datetime.datetime'>
# ValueError: time data '2026/08/15' does not match format '%d-%m-%Y'`
            ]
        },
        {
            content: `<h4>ISO 8601 Text: isoformat() and fromisoformat()</h4>
For storing dates in files, databases and APIs, use the standard ISO format - it sorts correctly as text and every language can read it.`,
            codeExamples: [
                `from datetime import date, datetime

dt = datetime(2026, 10, 4, 18, 30)
text = dt.isoformat()
print(text)

back = datetime.fromisoformat(text)
print(back == dt)
print(date.fromisoformat("2026-12-15"))

# OUTPUT:
# 2026-10-04T18:30:00
# True
# 2026-12-15`
            ]
        },
        {
            content: `<h4>The time Module</h4>
• <code>time.time()</code> - seconds since the Unix epoch (1 January 1970 UTC), as a float.<br>
• <code>time.sleep(seconds)</code> - pause the program.<br>
• <code>time.perf_counter()</code> - a high-resolution clock for <b>measuring how long</b> something takes.`,
            codeExamples: [
                `import time

print(time.time())                  # varies: seconds since 1970

start = time.perf_counter()
time.sleep(0.5)
total = sum(range(1_000_000))
elapsed = time.perf_counter() - start
print(f"took {elapsed:.2f} s")

# OUTPUT (varies - e.g.):
# 1791140412.5873
# took 0.53 s`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Naive vs Aware Datetimes</h3>
A <b>naive</b> datetime has no time zone (<code>tzinfo</code> is <code>None</code>) - "18:30" but 18:30 <i>where</i>? An <b>aware</b> datetime carries its zone or UTC offset, so it identifies one exact instant. Python refuses to compare or subtract the two kinds.`,
            codeExamples: [
                `from datetime import datetime, timezone

naive = datetime(2026, 10, 4, 18, 30)
aware = datetime(2026, 10, 4, 13, 0, tzinfo=timezone.utc)

print(naive.tzinfo, aware.tzinfo)
print(naive < aware)

# OUTPUT:
# None UTC
# TypeError: can't compare offset-naive and offset-aware datetimes`
            ]
        },
        {
            content: `<h3>Time Zones with zoneinfo (Python 3.9+)</h3>
<code>zoneinfo.ZoneInfo</code> uses the IANA time-zone database ("Asia/Kolkata", "America/New_York"), including daylight-saving rules. <code>astimezone()</code> converts the same instant to another zone. On Windows, install the <code>tzdata</code> package (<code>pip install tzdata</code>) if zone names aren't found.`,
            codeExamples: [
                `from datetime import datetime, timezone
from zoneinfo import ZoneInfo

class_start = datetime(2026, 10, 4, 18, 30, tzinfo=ZoneInfo("Asia/Kolkata"))
print(class_start)

in_utc = class_start.astimezone(timezone.utc)
print(in_utc)

in_new_york = class_start.astimezone(ZoneInfo("America/New_York"))
print(in_new_york)                       # daylight saving time is still on in early October

print(class_start == in_utc == in_new_york)   # the same instant

# OUTPUT:
# 2026-10-04 18:30:00+05:30
# 2026-10-04 13:00:00+00:00
# 2026-10-04 09:00:00-04:00
# True`
            ]
        },
        {
            content: `<h3>Store UTC, Display Local</h3>
The standard practice for servers and databases: record every timestamp as an aware datetime in <b>UTC</b>, and convert to the user's zone only when displaying it. Get the current UTC time with <code>datetime.now(timezone.utc)</code>. The older <code>datetime.utcnow()</code> is <b>deprecated since Python 3.12</b> - it returns a naive datetime that is easily mistaken for local time.`,
            codeExamples: [
                `from datetime import datetime, timezone
from zoneinfo import ZoneInfo

created_at = datetime(2026, 10, 4, 13, 0, tzinfo=timezone.utc)   # as stored
stored_text = created_at.isoformat()
print(stored_text)

loaded = datetime.fromisoformat(stored_text)
local = loaded.astimezone(ZoneInfo("Asia/Kolkata"))
print(local.strftime("%d %b %Y, %I:%M %p"))

now_utc = datetime.now(timezone.utc)      # the right way to get "now" in UTC
print(now_utc.tzinfo)

# OUTPUT:
# 2026-10-04T13:00:00+00:00
# 04 Oct 2026, 06:30 PM
# UTC`
            ]
        },
        {
            content: `<h3>Working with timedelta</h3>
A <code>timedelta</code> stores days, seconds and microseconds internally. <code>total_seconds()</code> converts the whole duration to one number - <code>.seconds</code> alone ignores the days, a common bug.`,
            codeExamples: [
                `from datetime import timedelta

lecture = timedelta(hours=1, minutes=30)
print(lecture, lecture.total_seconds())

trip = timedelta(days=1, hours=2)
print(trip)
print(trip.seconds, trip.total_seconds())    # .seconds ignores the day!

print(timedelta(hours=10) * 3, timedelta(hours=3) / timedelta(minutes=45))

# OUTPUT:
# 1:30:00 5400.0
# 1 day, 2:00:00
# 7200 93600.0
# 1 day, 6:00:00 4.0`
            ]
        },
        {
            content: `<h3>Measure Durations with a Monotonic Clock</h3>
<code>time.time()</code> follows the wall clock, which can jump when the system time is adjusted (NTP sync, manual changes). For measuring elapsed time use <code>time.perf_counter()</code> or <code>time.monotonic()</code>, which never go backwards. For benchmarking small snippets, the <code>timeit</code> module repeats them for you.`,
            codeExamples: [
                `import time

def timed(func, *args):
    start = time.perf_counter()
    result = func(*args)
    return result, time.perf_counter() - start

result, seconds = timed(sum, range(10_000_000))
print(result, seconds > 0)

# OUTPUT:
# 49999995000000 True`
            ]
        },
        {
            content: `<h3>Java java.time Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Java</th><th>Python</th></tr>
<tr class='text-center'><td><code>LocalDate.of(2026, 10, 4)</code></td><td><code>date(2026, 10, 4)</code></td></tr>
<tr class='text-center'><td><code>LocalDateTime</code></td><td>naive <code>datetime</code></td></tr>
<tr class='text-center'><td><code>ZonedDateTime</code></td><td>aware <code>datetime</code> with <code>ZoneInfo</code></td></tr>
<tr class='text-center'><td><code>Instant.now()</code></td><td><code>datetime.now(timezone.utc)</code></td></tr>
<tr class='text-center'><td><code>Duration</code> / <code>Period</code></td><td><code>timedelta</code></td></tr>
<tr class='text-center'><td><code>DateTimeFormatter.ofPattern("dd/MM/yyyy")</code></td><td><code>strftime("%d/%m/%Y")</code> / <code>strptime</code></td></tr>
<tr class='text-center'><td><code>date.plusDays(30)</code></td><td><code>d + timedelta(days=30)</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>strftime vs strptime?</td><td>strftime formats a datetime into text; strptime parses text into a datetime</td></tr>
<tr class='text-center'><td>What do you get when you subtract two dates?</td><td>A timedelta</td></tr>
<tr class='text-center'><td>Naive vs aware datetime?</td><td>Naive has no time zone; aware carries tzinfo and represents an exact instant</td></tr>
<tr class='text-center'><td>How do you get the current UTC time?</td><td><code>datetime.now(timezone.utc)</code> - utcnow() is deprecated since 3.12</td></tr>
<tr class='text-center'><td>How should timestamps be stored?</td><td>In UTC (ISO 8601 text or a timestamp column), converted to local time only for display</td></tr>
<tr class='text-center'><td>time.time() vs time.perf_counter()?</td><td>time() is wall-clock epoch time; perf_counter() is a monotonic high-resolution clock for measuring durations</td></tr>
<tr class='text-center'><td>timedelta.seconds vs total_seconds()?</td><td>.seconds is only the seconds part (0-86399); total_seconds() includes days</td></tr>
</table>`
        }
    ]
};
