**Single Source Shortest Paths:**  
Graphs can be used to represent the highway structure of a state or country with  
vertices representing cities and edges representing sections of highway.  
The edges have assigned weights which may be either the distance between the 2  
cities connected by the edge or the average time to drive along that section of  
highway.  
For example if A motorist wishing to drive from city A to B then we must answer the  
following questions  
o Is there a path from A to B  
o If there is more than one path from A to B which is the shortest path  
The length of a path is defined to be the sum of the weights of the edges on that path.  
Given a directed graph G(V,E) with weight edge w(u,v). e have to find a shortest path from  
source vertex S∈ v to every other vertex v1∈ v-s.

To find SSSP for directed graphs G(V,E) there are two different algorithms.  
 **Bellman-Ford Algorithm**  
 **Dijkstra’s algorithm**  
**Bellman-Ford Algorithm:**\- allow –ve weight edges in input graph. This algorithm  
either finds a shortest path form source vertex S∈ V to other vertex v∈ V or detect a –  
ve weight cycles in G, hence no solution. If there is no negative weight cycles are  
reachable form source vertex S∈ V to every other vertex v∈ V  
**Dijkstra’s algorithm:**\- allows only \+ve weight edges in the input graph and finds a  
shortest path from source vertex S∈ V to every other vertex v∈ V.

Algorithm for finding Shortest Path  
\`\`\`  
Algorithm ShortestPath(v, cost, dist, n)  
//dist\[j\], 1≤j≤n, is set to the length of the shortest path from vertex v to vertex j in graph g  
with n-vertices.  
// dist\[v\] is zero  
{  
for i=1 to n do{  
s\[i\]=false;  
dist\[i\]=cost\[v,i\];  
}  
s\[v\]=true;  
dist\[v\]:=0.0; // put v in s  
for num=2 to n do{  
// determine n-1 paths from v  
choose u form among those vertices not in s such that dist\[u\] is minimum.  
s\[u\]=true; // put u in s  
for (each w adjacent to u with s\[w\]=false) do  
if(dist\[w\]\>(dist\[u\]+cost\[u, w\])) then  
dist\[w\]=dist\[u\]+cost\[u, w\];  
}  
}  
\`\`\`

SPANNING TREE: \- A Sub graph ‘n’ of o graph ‘G’ is called as a spanning tree if  
(i) It includes all the vertices of ‘G’  
(ii) It is a tree

**Minimum cost spanning tree:** For a given graph ‘G,’ there can be more than one spanning tree. If weights are assigned to the edges of ‘G,’ then the spanning tree which has the The minimum cost of edges is called the minimal spanning tree.  
The greedy method suggests that a minimum cost spanning tree can be obtained by contacting the tree edge by edge. The next edge to be included in the tree is the edge that results in a minimum increase in the sum of the costs of the edges included so far.  
There are two basic algorithms for finding minimum-cost spanning trees, and both are greedy Algorithms.

