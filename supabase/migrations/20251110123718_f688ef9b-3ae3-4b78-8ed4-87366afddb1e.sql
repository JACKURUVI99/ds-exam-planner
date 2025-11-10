-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS policy: Only admins can insert roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create sections table
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Everyone can read sections
CREATE POLICY "Everyone can view sections"
ON public.sections
FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage sections
CREATE POLICY "Admins can manage sections"
ON public.sections
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create topics table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Everyone can read topics
CREATE POLICY "Everyone can view topics"
ON public.topics
FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage topics
CREATE POLICY "Admins can manage topics"
ON public.topics
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create user_progress table to track completed topics
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, topic_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their own progress"
ON public.user_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can manage their own progress
CREATE POLICY "Users can manage their own progress"
ON public.user_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Insert initial sections
INSERT INTO public.sections (title, emoji, display_order) VALUES
  ('Until 25/08', '📘', 1),
  ('Until 24/09', '📗', 2),
  ('After CT2', '📙', 3),
  ('Algorithms Covered in Class', '🧩', 4);

-- Insert topics for section 1 (Until 25/08)
INSERT INTO public.topics (section_id, text, display_order)
SELECT id, topic_text, topic_order
FROM public.sections,
LATERAL (VALUES
  ('What is data structure', 1),
  ('Modular Programming', 2),
  ('Basic Data Types (int, float, char, bool) - read about binary representation as well', 3),
  ('Structures (struct) and Unions (union)', 4),
  ('Types of Datatypes — Primitive / Non-primitive (Abstract): {Sequential, Linked → {Linear, Non-linear}}', 5),
  ('Memory concepts — Word, Address, Range, Register, Scope, MAR, MBR, RAM, ROM', 6),
  ('Operations on Data Structures (Create, Update, Access, Deallocate)', 7),
  ('Errors — Compile time and Runtime', 8),
  ('Non-Primitive Datatypes — Array (1D, 2D {Row/Column Major}, Addressing Function), Stack, Queue, Record (Flatfile, Database)', 9),
  ('Algorithm and its Properties, Flowchart', 10),
  ('Algorithmic Constructs', 11),
  ('Functions and Procedures, Macro and Micro Operations (T State)', 12),
  ('Format of Algorithms', 13),
  ('Stack Operations — PUSH, POP, PEEP, CHANGE', 14),
  ('Stack Overflow & Underflow; Usage (Recursion, Expression Evaluation, String Ops)', 15),
  ('Program Counter (PC)', 16),
  ('Infix & Postfix (Reverse Polish Notation), Conversion', 17),
  ('Computer Architecture — Registers {Multiple, Dedicated, Stack Machine}', 18),
  ('Assembly — Opcodes (MOV, STO, ADD, SUB, MUL, DIV, BRN, JMP)', 19)
) AS t(topic_text, topic_order)
WHERE title = 'Until 25/08';

-- Insert topics for section 2 (Until 24/09)
INSERT INTO public.topics (section_id, text, display_order)
SELECT id, topic_text, topic_order
FROM public.sections,
LATERAL (VALUES
  ('Queues — Operations {Enqueue, Dequeue}, Circular Queue, Job Scheduling', 1),
  ('Priority Queues, Multilevel Queues (17/09)', 2),
  ('Linked Lists: Types {Single, Double} × {Ordered, Circular}', 3),
  ('Structure Node, Linking Nodes, Header Node', 4),
  ('Create a new list, Insert/Delete (Start, Middle, End), Search', 5),
  ('Double Ended Queue (Deque)', 6),
  ('Linear and Non-linear Data Structures', 7),
  ('Tree Terminologies {Root, Parent, Child, Leaf}', 8),
  ('Binary Trees, Tree Traversal (Pre-order, In-order, Post-order)', 9),
  ('Graph — Vertices, Edges, Loops, Cycles, Adjacency Matrix, BFS, DFS, TSP, Multigraph', 10),
  ('Heap — Min/Max Heap, Insertion, Applications', 11),
  ('Sorting — Stable/Unstable, In-place/Auxiliary', 12),
  ('Searching — Comparison/Distribution Based', 13),
  ('Hash Table (x mod m), Collision Handling via Chaining', 14),
  ('Algorithm Analysis — Time (Best/Worst/Average), Space', 15),
  ('Binary Search Tree, Balanced BST', 16),
  ('Sorting Algorithms — Bubble, Selection, Insertion, Merge', 17)
) AS t(topic_text, topic_order)
WHERE title = 'Until 24/09';

-- Insert topics for section 3 (After CT2)
INSERT INTO public.topics (section_id, text, display_order)
SELECT id, topic_text, topic_order
FROM public.sections,
LATERAL (VALUES
  ('Files — Sequential & Random Access', 1),
  ('Access Time (Latency)', 2),
  ('Allocation — Contiguous, Linked, Indexed', 3),
  ('Fragmentation — Internal & External', 4),
  ('Input/Output Stream, File Stream', 5),
  ('Threaded Binary Trees — Single, Double', 6),
  ('Tables — Implementation via 2D Array, Hash, Symbol, Database Table', 7),
  ('Data Structure: Set', 8),
  ('Templates (C++, Java) - unclear coverage', 9)
) AS t(topic_text, topic_order)
WHERE title = 'After CT2';

-- Insert topics for section 4 (Algorithms)
INSERT INTO public.topics (section_id, text, display_order)
SELECT id, topic_text, topic_order
FROM public.sections,
LATERAL (VALUES
  ('Algorithm Sum(A, B)', 1),
  ('Algorithm PUSH(S, X)', 2),
  ('Function POP(S)', 3),
  ('Function PEEP(S, I)', 4),
  ('Algorithm Factorial(N)', 5),
  ('Algorithm: Convert Infix → Postfix', 6),
  ('Algorithm: Evaluate Postfix', 7),
  ('Assembly for Infix→Postfix (General Purpose + Stack Machine)', 8),
  ('Assembly for Postfix Evaluation (Stack Machine)', 9),
  ('Algorithm ENQUEUE / DEQUEUE', 10),
  ('Linked List Functions — InsertFirst/Last/Middle, DeleteFirst/Last/Middle (SLL/DLL)', 11),
  ('UNSOLVED: Copy a given list', 12),
  ('UNSOLVED: Check if list is sorted', 13),
  ('UNSOLVED: Search for element', 14),
  ('UNSOLVED: Insert node in order (recursive & non-recursive)', 15),
  ('Algorithm PREORDER(T)', 16),
  ('Algorithm INORDER(T)', 17),
  ('Algorithm COPY(T)', 18),
  ('Algorithm to Build Expression Tree (from Postfix)', 19),
  ('Algorithm to Evaluate Expression Tree', 20),
  ('Sorting Algorithms — All types', 21),
  ('File Read/Write Code Snippet', 22)
) AS t(topic_text, topic_order)
WHERE title = 'Algorithms Covered in Class';