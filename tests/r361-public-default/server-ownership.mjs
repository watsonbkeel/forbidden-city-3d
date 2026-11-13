export async function listenOwned(server,port=0){
 if(!Number.isInteger(port)||port<0||port>65535)throw Error('bounded local port required');
 await new Promise((resolve,reject)=>{const failed=e=>{server.removeListener('listening',ready);reject(e);},ready=()=>{server.removeListener('error',failed);resolve();};server.once('error',failed);server.once('listening',ready);try{server.listen(port,'127.0.0.1');}catch(e){server.removeListener('error',failed);server.removeListener('listening',ready);reject(e);}});
}
export async function closeOwnedServers(servers){const errors=[];for(const server of servers)try{server.closeAllConnections();if(server.listening)await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}catch(e){errors.push(e);}if(errors.length)throw new AggregateError(errors,'server cleanup failed');}
export async function withOwnedServerSetup(setup){const servers=[];const own=server=>{servers.push(server);return server;};try{return await setup(own);}catch(primary){try{await closeOwnedServers(servers);}catch(cleanup){throw new AggregateError([primary,cleanup],'server initialization and cleanup failed');}throw primary;}}
