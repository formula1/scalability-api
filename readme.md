# Purpose

Have you ever wanted to use the exact same api for when your scaling from
a single thread to many? or a single server to thousands? Do you want to do it
in node? Well, you might be crazy but your not alone. This is the start of my
solution.

# Concept

Scalability comes in a few flavors
- Pull Scaling - Managers can create a new thread/pull system resources as you need it. Currently, node does not handle webworkers so I have to make them child_processes instead
- Push Scaling - Managers do not have control over processes that connect to it. They need to accept what workers (or lack there of) they have. AWS and other services allow you to scale on the fly. This may be ideal down the road to allow Horizontal Scaling mechanisms to be able to be considered Vertical.


Types of Structuring
- Nested - When there is only one thread sending/retrieving data but multiple instances/workers can and must identically handle the data, this will likely become more relevent.
- Network - Stable marriage for short paths. This will likely become more relevent when there isn't one descrete requestor and not one descrete provider.
- Sharded - When different instances provide descrete service matching certian conditions


Types of scalable machines
- Data - Mutable Memory/Database. Must pay attention to timestamps
  - Takes in CRUD request
  - Stores whatever is input
  - output comes from what is Stored
    - May also act as an event emitter
- Worker - Takes input, gives output
  - Takes an input to be processed
  - Stores nothing
  - Output depends on the Input
- EventEmitters - Blindly emits to whatever is connected to it
  - Takes in an event
  - Stores nothing
  - Outputs the event to connected
- Proxy - Identifies where a request should be processed and what can provide what it desires
  - Takes in a request (Process, CRUD, Event, anything)
  - Stores Machines that can handle these requests
  - Outputs whatever the machine provides it that handled the request
- Manager - Accepts/Creates workers and/or directs them to do work
  - Takes in Request
  - Stores connected duplicate workers
  - Provides whatever a worker handled
- Adaptable - Basically a manager can order it to change

Environments
- Server - Limited to technology available
- Client - Currently, Clients cannot open up ports to possible incomming connections. The only way to support Networked instances is with a facilitator of some sort.

# Status
- Working on a few things.
