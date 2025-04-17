Prim’s Algorithm: Start with any one node in the spanning tree, and repeatedly add the  
cheapest edge, and the node it leads to, for which the node is not already in the spanning tree.  
**PRIM’S ALGORITHM: \-**  
i) Select an edge with minimum cost and include in to the spanning tree.  
ii) Among all the edges which are adjacent with the selected edge, select the  
onewith minimum cost.  
iii) Repeat step 2 until ‘n’ vertices and (n-1) edges are been included. And the  
subgraphobtained does not contain any cycles.  
Notes: \- At every state a decision is made about an edge of minimum cost to be included  
into the spanning tree. From the edges which are adjacent to the last edge included in  
the spanning tree i.e. at every stage the sub-graph obtained is a tree.  
Prim's minimum spanning tree algorithm  
Algorithm Prim (E, cost, n,t)  
\`\`\`  
Algorithm Prim (E, cost, n,t)  
{  
Let (k, l) be an edge with min cost  
in E Min cost: \= Cost (x,l);  
T(1,1):= k; \+ (1,2):= l;  
for i:= 1 to n do//initialize  
near  
if (cost (i,l)\<cost (i,k) then n east  
(i): l; else near (i): \= k;  
near (k): \= near (l): \=  
0; for i: \= 2 to n-1 do  
{//find n-2 additional edges for t  
let j be an index such that near (i) 0 & cost (j, near (i)) is  
minimum;t (i,1): \= j \+ (i,2): \= near (j);  
min cost: \= Min cost \+ cost (j, near  
(j)); near (j): \= 0;  
for k:=1 to n do // update near ()  
if ((near (k) 0\) and (cost {k, near (k)) \> cost  
(k,j))) then near Z(k): \= ji  
}  
return mincost;  
}  
\`\`\`  
The time required by the prince algorithm is directly proportional to the no/: of vertices.  
If agraph ‘G’ has ‘n’ vertices then the time required by prim’s algorithm is 0(n2).

**Kruskal’s Algorithm:**   
Start with no nodes or edges in the spanning tree, and repeatedly add the cheapest edge that does not create a cycle. In Kruskals algorithm for determining the spanning tree we arrange the edges in the increasing order of cost.  
i) All the edges are considered one by one in that order and deleted from the graph  
and areincluded in to the spanning tree.  
ii) At every stage an edge is included; the sub-graph at a stage need not be a  
tree. Infect it is a forest.  
iii) At the end if we include ‘n’ vertices and n-1 edges without forming cycles then  
we get a single connected component without any cycles i.e. a tree with  
minimum cost.  
At every stage, as we include an edge in to the spanning tree, we get disconnected trees  
represented by various sets. While including an edge in to the spanning tree we need to  
check it does not form cycle. Inclusion of an edge (i,j) will form a cycle if i,j both are in  
same set. Otherwise the edge can be included into the spanning tree

Kruskal minimum spanning tree algorithm  
Algorithm Kruskal (E, cost, n,t)  
\`\`\`  
{ construct a heap out of the edge costs using heapify;  
for i:= 1 to n do parent (i):= \-1 // place in different sets  
//each vertex is in different set {1} {1}  
{3} i: \= 0; min cost: \= 0.0;  
While (i\<n-1) and (heap not empty))do  
{  
Delete a minimum cost edge (u,v) from the heaps; and reheapify using  
adjust; j:= find (u); k:=find (v);  
if (j k) then  
{ i: \= 1+1;  
\+ (i,1)=u; \+ (i, 2)=v;  
mincost: \=  
mincost+cost(u,v); Union  
(j,k);  
}  
}  
if (i n-1) then write (“No  
spanningtree”);else return  
mincost;  
}

