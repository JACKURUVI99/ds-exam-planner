import { useState, useEffect } from "react";
import { TopicSection } from "@/components/TopicSection";
import { CheckCircle2, Trophy, Target } from "lucide-react";

const sections = [
  {
    id: "section-1",
    title: "Until 25/08",
    emoji: "📘",
    topics: [
      { id: "1-1", text: "What is data structure" },
      { id: "1-2", text: "Modular Programming" },
      { id: "1-3", text: "Basic Data Types (int, float, char, bool) - read about binary representation as well" },
      { id: "1-4", text: "Structures (struct) and Unions (union)" },
      { id: "1-5", text: "Types of Datatypes — Primitive / Non-primitive (Abstract): {Sequential, Linked → {Linear, Non-linear}}" },
      { id: "1-6", text: "Memory concepts — Word, Address, Range, Register, Scope, MAR, MBR, RAM, ROM" },
      { id: "1-7", text: "Operations on Data Structures (Create, Update, Access, Deallocate)" },
      { id: "1-8", text: "Errors — Compile time and Runtime" },
      { id: "1-9", text: "Non-Primitive Datatypes — Array (1D, 2D {Row/Column Major}, Addressing Function), Stack, Queue, Record (Flatfile, Database)" },
      { id: "1-10", text: "Algorithm and its Properties, Flowchart" },
      { id: "1-11", text: "Algorithmic Constructs" },
      { id: "1-12", text: "Functions and Procedures, Macro and Micro Operations (T State)" },
      { id: "1-13", text: "Format of Algorithms" },
      { id: "1-14", text: "Stack Operations — PUSH, POP, PEEP, CHANGE" },
      { id: "1-15", text: "Stack Overflow & Underflow; Usage (Recursion, Expression Evaluation, String Ops)" },
      { id: "1-16", text: "Program Counter (PC)" },
      { id: "1-17", text: "Infix & Postfix (Reverse Polish Notation), Conversion" },
      { id: "1-18", text: "Computer Architecture — Registers {Multiple, Dedicated, Stack Machine}" },
      { id: "1-19", text: "Assembly — Opcodes (MOV, STO, ADD, SUB, MUL, DIV, BRN, JMP)" },
    ],
  },
  {
    id: "section-2",
    title: "Until 24/09",
    emoji: "📗",
    topics: [
      { id: "2-1", text: "Queues — Operations {Enqueue, Dequeue}, Circular Queue, Job Scheduling" },
      { id: "2-2", text: "Priority Queues, Multilevel Queues (17/09)" },
      { id: "2-3", text: "Linked Lists: Types {Single, Double} × {Ordered, Circular}" },
      { id: "2-4", text: "Structure Node, Linking Nodes, Header Node" },
      { id: "2-5", text: "Create a new list, Insert/Delete (Start, Middle, End), Search" },
      { id: "2-6", text: "Double Ended Queue (Deque)" },
      { id: "2-7", text: "Linear and Non-linear Data Structures" },
      { id: "2-8", text: "Tree Terminologies {Root, Parent, Child, Leaf}" },
      { id: "2-9", text: "Binary Trees, Tree Traversal (Pre-order, In-order, Post-order)" },
      { id: "2-10", text: "Graph — Vertices, Edges, Loops, Cycles, Adjacency Matrix, BFS, DFS, TSP, Multigraph" },
      { id: "2-11", text: "Heap — Min/Max Heap, Insertion, Applications" },
      { id: "2-12", text: "Sorting — Stable/Unstable, In-place/Auxiliary" },
      { id: "2-13", text: "Searching — Comparison/Distribution Based" },
      { id: "2-14", text: "Hash Table (x mod m), Collision Handling via Chaining" },
      { id: "2-15", text: "Algorithm Analysis — Time (Best/Worst/Average), Space" },
      { id: "2-16", text: "Binary Search Tree, Balanced BST" },
      { id: "2-17", text: "Sorting Algorithms — Bubble, Selection, Insertion, Merge" },
    ],
  },
  {
    id: "section-3",
    title: "After CT2",
    emoji: "📙",
    topics: [
      { id: "3-1", text: "Files — Sequential & Random Access" },
      { id: "3-2", text: "Access Time (Latency)" },
      { id: "3-3", text: "Allocation — Contiguous, Linked, Indexed" },
      { id: "3-4", text: "Fragmentation — Internal & External" },
      { id: "3-5", text: "Input/Output Stream, File Stream" },
      { id: "3-6", text: "Threaded Binary Trees — Single, Double" },
      { id: "3-7", text: "Tables — Implementation via 2D Array, Hash, Symbol, Database Table" },
      { id: "3-8", text: "Data Structure: Set" },
      { id: "3-9", text: "Templates (C++, Java) - unclear coverage" },
    ],
  },
  {
    id: "section-4",
    title: "Algorithms Covered in Class",
    emoji: "🧩",
    topics: [
      { id: "4-1", text: "Algorithm Sum(A, B)" },
      { id: "4-2", text: "Algorithm PUSH(S, X)" },
      { id: "4-3", text: "Function POP(S)" },
      { id: "4-4", text: "Function PEEP(S, I)" },
      { id: "4-5", text: "Algorithm Factorial(N)" },
      { id: "4-6", text: "Algorithm: Convert Infix → Postfix" },
      { id: "4-7", text: "Algorithm: Evaluate Postfix" },
      { id: "4-8", text: "Assembly for Infix→Postfix (General Purpose + Stack Machine)" },
      { id: "4-9", text: "Assembly for Postfix Evaluation (Stack Machine)" },
      { id: "4-10", text: "Algorithm ENQUEUE / DEQUEUE" },
      { id: "4-11", text: "Linked List Functions — InsertFirst/Last/Middle, DeleteFirst/Last/Middle (SLL/DLL)" },
      { id: "4-12", text: "UNSOLVED: Copy a given list" },
      { id: "4-13", text: "UNSOLVED: Check if list is sorted" },
      { id: "4-14", text: "UNSOLVED: Search for element" },
      { id: "4-15", text: "UNSOLVED: Insert node in order (recursive & non-recursive)" },
      { id: "4-16", text: "Algorithm PREORDER(T)" },
      { id: "4-17", text: "Algorithm INORDER(T)" },
      { id: "4-18", text: "Algorithm COPY(T)" },
      { id: "4-19", text: "Algorithm to Build Expression Tree (from Postfix)" },
      { id: "4-20", text: "Algorithm to Evaluate Expression Tree" },
      { id: "4-21", text: "Sorting Algorithms — All types" },
      { id: "4-22", text: "File Read/Write Code Snippet" },
    ],
  },
];

const Index = () => {
  const [checkedTopics, setCheckedTopics] = useState<Set<string>>(new Set());

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dsa-progress");
    if (saved) {
      setCheckedTopics(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("dsa-progress", JSON.stringify(Array.from(checkedTopics)));
  }, [checkedTopics]);

  const handleToggleTopic = (id: string) => {
    setCheckedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const totalTopics = sections.reduce((sum, section) => sum + section.topics.length, 0);
  const completedTopics = Array.from(checkedTopics).length;
  const overallProgress = (completedTopics / totalTopics) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  DSA Exam Prep Tracker
                </h1>
                <p className="text-muted-foreground mt-1">
                  Data Structures and Algorithms (EEPC37)
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">
                      {completedTopics}
                    </span>
                    <span className="text-muted-foreground">/ {totalTopics}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Topics Completed</p>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Overall Progress</span>
                </div>
                <span className="font-semibold text-foreground">
                  {overallProgress.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${overallProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 max-w-5xl mx-auto">
          {sections.map((section) => (
            <TopicSection
              key={section.id}
              title={section.title}
              emoji={section.emoji}
              topics={section.topics}
              checkedTopics={checkedTopics}
              onToggleTopic={handleToggleTopic}
            />
          ))}
        </div>

        {/* Completion Message */}
        {overallProgress === 100 && (
          <div className="fixed bottom-8 right-8 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-gradient-primary rounded-xl p-6 shadow-2xl border border-primary/20 max-w-sm">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary-foreground" />
                <div>
                  <h3 className="font-bold text-primary-foreground">
                    Congratulations! 🎉
                  </h3>
                  <p className="text-sm text-primary-foreground/90">
                    You've completed all topics!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
