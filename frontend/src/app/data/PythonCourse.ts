// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
import { pythonModules } from './pythonModules';
export type { ContentBlock, Topic, SubTopic, Course };

export const PythonCourse: Course[] = [
    {
        id: 'python',
        name: 'Python',
        icon: 'FileText',
        subTopics: pythonModules,
        cheatNotes: [
            // Fundamentals
            'print() - Outputs text to the console',
            'Indentation - Defines code blocks in Python (no curly braces)',
            'python -m venv .venv - Create a virtual environment',
            'pip install <package> - Install a package',
            'type(x) / isinstance(x, T) - Inspect an object\'s type',
            'is vs == - Identity (same object) vs equality (same value)',
            'f-string - f"{variable}" for inline string formatting',
            'list - Mutable, ordered collection: [1, 2, 3]',
            'tuple - Immutable, ordered collection: (1, 2, 3)',
            'dict - Key-value mapping: {"key": "value"}',
            'set - Unordered collection of unique elements',
            'copy.copy() / copy.deepcopy() - Shallow vs deep copy',
            'match/case - Structural pattern matching (Python 3.10+)',
            'List comprehension - [expr for item in iterable if condition]',
            'def - Keyword to define a function',
            '*args / **kwargs - Variable-length positional / keyword arguments',
            'global / nonlocal - Rebind a variable in module / enclosing scope',
            'lambda - Anonymous, single-expression function',
            'map() / filter() / reduce() - Functional-style iteration helpers',
            'try / except / else / finally - Exception handling in Python',
            'raise ... from ... - Chain a new exception onto its cause',
            'with statement - Context manager, e.g. auto-closes files',
            'if __name__ == "__main__": - Run code only when executed directly',
            // Intermediate
            'class - Keyword to define a class',
            '__init__ - Constructor method, runs when an object is created',
            'self - Refers to the current instance (like \'this\' in Java)',
            'super() - Calls the parent class\'s method/constructor',
            '__str__ / __repr__ - Readable vs developer-facing string form',
            '@classmethod / @staticmethod / @property - Method kinds and managed attributes',
            'ClassName.__mro__ - Method Resolution Order for multiple inheritance',
            'yield - Turns a function into a lazy generator',
            'Closure - Inner function that remembers variables from its enclosing scope',
            '@decorator - Wraps a function to extend its behaviour; use functools.wraps',
            '@contextmanager - Build a context manager from a generator',
            're.search() / re.findall() / re.sub() - Regex search, collect, replace',
            'Optional[T] / T | None - Value may be None (type hint)',
            'pytest - Test runner using plain assert, fixtures and parametrize',
            'logging.getLogger(__name__) - Module-level logger',
            // Expert
            'sys.getrefcount(obj) - Inspect an object\'s reference count',
            'dis.dis(func) - Disassemble a function into bytecode',
            'GIL - Only one thread executes Python bytecode at a time (CPython)',
            'threading - Concurrency for I/O-bound work',
            'multiprocessing - Parallelism for CPU-bound work',
            'async / await / asyncio.gather() - Cooperative concurrency on one event loop',
            'functools.lru_cache - Memoize a function\'s results',
            'cProfile / timeit - Find and measure slow code',
            '__slots__ - Fixed attribute set, lower memory per instance',
            'Descriptor - Object defining __get__/__set__ to control attribute access',
            'Metaclass - The class of a class; customizes class creation',
            'pyproject.toml - Modern project and packaging configuration',
            'PEP 8 - Python\'s official style guide',
        ],
        interviewQuestions: [
            {
                company: 'General Python Interview',
                questions: [
                    'What is the difference between a list and a tuple?',
                    'What is the difference between mutable and immutable objects?',
                    'What is the difference between "is" and "=="?',
                    'What is a list comprehension, and why use one?',
                    'Explain *args and **kwargs.',
                    'What is the difference between a lambda function and a regular function?',
                    'What is the difference between deep copy and shallow copy?',
                    'How does inheritance work in Python, and what does super() do?',
                    'What is the Method Resolution Order (MRO)?',
                    'What is the difference between @classmethod and @staticmethod?',
                    'What are dunder (magic) methods? Give examples.'
                ]
            },
            {
                company: 'Advanced Python Interview',
                questions: [
                    'What is the difference between an iterator and a generator?',
                    'What is a closure, and how does nonlocal relate to it?',
                    'What are Python decorators, and why use functools.wraps?',
                    'How do you write a custom context manager?',
                    'How does Python manage memory? Explain reference counting and garbage collection.',
                    'Why does Python sometimes reuse the same object (interning / small int caching)?',
                    'What is the Global Interpreter Lock (GIL)?',
                    'When would you use threading vs multiprocessing vs asyncio?',
                    'What is a descriptor?',
                    'What is a metaclass, and when would you use one?',
                    'What does __slots__ do?',
                    'How would you find out why a piece of Python code is slow?'
                ]
            }
        ]
    }
];
