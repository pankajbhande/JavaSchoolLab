// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };
// ===== Interfaces =====








// ===== Module 01 — JVM Architecture =====
import { classLoaderJvm } from './topics/ClassLoaderJvm';
import { runtimeDataAreas } from './topics/RuntimeDataAreas';
import { heapMemoryJvm } from './topics/HeapMemoryJvm';
import { stackMemoryJvm } from './topics/StackMemoryJvm';
import { methodAreaJvm } from './topics/MethodAreaJvm';
import { metaspaceJvm } from './topics/MetaspaceJvm';
import { pcRegisterJvm } from './topics/PcRegisterJvm';
import { nativeMethodStackJvm } from './topics/NativeMethodStackJvm';

// ===== Module 02 — Object Memory =====
import { objectCreationMemory } from './topics/ObjectCreationMemory';
import { referencesInJava } from './topics/ReferencesInJava';
import { stackVsHeap } from './topics/StackVsHeap';
import { stringPoolJava } from './topics/StringPoolJava';
import { staticVariablesMemory } from './topics/StaticVariablesMemory';
import { instanceVariablesMemory } from './topics/InstanceVariablesMemory';

// ===== Module 03 — Garbage Collection =====
import { gcFundamentals } from './topics/GcFundamentals';
import { generationalGc } from './topics/GenerationalGc';
import { g1Collector } from './topics/G1Collector';
import { zgcCollector } from './topics/ZgcCollector';
import { gcCycles } from './topics/GcCycles';
import { gcTuning } from './topics/GcTuning';

// ===== Module 04 — JVM Performance =====
import { jitCompiler } from './topics/JitCompiler';
import { escapeAnalysis } from './topics/EscapeAnalysis';
import { jvmArguments } from './topics/JvmArguments';
import { heapDumps } from './topics/HeapDumps';
import { threadDumps } from './topics/ThreadDumps';
import { jfrTool } from './topics/JfrTool';
import { jmcTool } from './topics/JmcTool';
import { jstackCommand } from './topics/JstackCommand';
import { jmapCommand } from './topics/JmapCommand';
import { jcmdCommand } from './topics/JcmdCommand';

// ===== Module 05 — JVM Problems =====
import { outOfMemoryErrorJava } from './topics/OutOfMemoryErrorJava';
import { stackOverflowErrorJava } from './topics/StackOverflowErrorJava';
import { highCpuJava } from './topics/HighCpuJava';
import { highGcJava } from './topics/HighGcJava';
import { memoryLeakJava } from './topics/MemoryLeakJava';
import { threadExhaustionJava } from './topics/ThreadExhaustionJava';

// ===== Course Data =====
export const JavaMemoryJVM: Course[] = [
  {
    id: 'java-memory-jvm',
    name: 'Java Memory & JVM',
    icon: 'Cpu',

    subTopics: [
      {
        id: 'jvm-architecture',
        name: 'JVM Architecture',
        topics: [
          classLoaderJvm,
          runtimeDataAreas,
          heapMemoryJvm,
          stackMemoryJvm,
          methodAreaJvm,
          metaspaceJvm,
          pcRegisterJvm,
          nativeMethodStackJvm
        ]
      },
      {
        id: 'object-memory',
        name: 'Object Memory',
        topics: [
          objectCreationMemory,
          referencesInJava,
          stackVsHeap,
          stringPoolJava,
          staticVariablesMemory,
          instanceVariablesMemory
        ]
      },
      {
        id: 'garbage-collection',
        name: 'Garbage Collection',
        topics: [
          gcFundamentals,
          generationalGc,
          g1Collector,
          zgcCollector,
          gcCycles,
          gcTuning
        ]
      },
      {
        id: 'jvm-performance',
        name: 'JVM Performance',
        topics: [
          jitCompiler,
          escapeAnalysis,
          jvmArguments,
          heapDumps,
          threadDumps,
          jfrTool,
          jmcTool,
          jstackCommand,
          jmapCommand,
          jcmdCommand
        ]
      },
      {
        id: 'jvm-problems',
        name: 'JVM Problems',
        topics: [
          outOfMemoryErrorJava,
          stackOverflowErrorJava,
          highCpuJava,
          highGcJava,
          memoryLeakJava,
          threadExhaustionJava
        ]
      }
    ],

    cheatNotes: [
      'Heap - stores objects and instance variables, shared across all threads',
      'Stack - per-thread, stores method call frames and local variables',
      'Metaspace - replaced PermGen since Java 8, stores class metadata in native memory',
      'PC Register - per-thread, tracks the address of the currently executing instruction',
      'Young Gen - Eden + 2 Survivor spaces, where most short-lived objects are created and collected',
      'Old Gen - long-lived objects promoted after surviving multiple minor GCs',
      'Minor GC - collects Young Generation, generally fast and frequent',
      'Major/Full GC - collects Old Generation (or entire heap), slower, causes longer pauses',
      'G1GC - default collector since Java 9, region-based, aims for predictable pause times',
      'ZGC - ultra-low-latency collector using colored pointers, sub-millisecond pauses',
      'StackOverflowError - stack exhausted, usually from unbounded/too-deep recursion',
      'OutOfMemoryError - heap, metaspace, or native memory exhausted',
      'jstack - dumps thread stacks, used to detect deadlocks and blocked threads',
      'jmap - dumps heap memory, used to analyze memory leaks',
      'jcmd - modern unified diagnostic command tool replacing most single-purpose JDK tools'
    ],

    interviewQuestions: [
      {
        company: 'General JVM & Memory Management',
        questions: [
          'Explain the JVM memory model: Heap, Stack, Method Area, Metaspace, PC Register.',
          'What is the difference between Stack and Heap memory?',
          'How does Garbage Collection work in Java?',
          'What is the difference between Minor GC and Major/Full GC?',
          'Explain the difference between G1GC and ZGC.',
          'What causes a StackOverflowError vs an OutOfMemoryError?',
          'How would you diagnose a memory leak in a running Java application?',
          'What is the String Pool and how does interning work?',
          'How do you generate and analyze a heap dump?',
          'What JVM flags would you tune to reduce GC pause times?'
        ]
      }
    ]
  }
];
