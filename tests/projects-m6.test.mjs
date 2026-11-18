import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function load(relative,mocks={}){
 const filename=path.resolve(relative),module={exports:{}};
 const {outputText}=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},fileName:filename});
 const resolve=name=>{if(Object.hasOwn(mocks,name))return mocks[name];if(name.startsWith('@/'))return load('src/'+name.slice(2)+'.ts',mocks);if(name.startsWith('.'))return load(path.resolve(path.dirname(filename),name+'.ts'),mocks);return require(name);};
 new Function('require','module','exports',outputText)(resolve,module,module.exports);return module.exports;
}
test('OAuth business codes distinguish collision, ownership, already-linked and expired state',()=>{
 const {identityErrorMessage:m}=load('src/utils/identityError.ts');
 assert.match(m('ACCOUNT_EXISTS_WITH_DIFFERENT_PROVIDER'),/đã tồn tại với email/);
 assert.match(m('IDENTITY_OWNED_BY_ANOTHER_USER'),/tài khoản KanbanGit khác/);
 assert.match(m('IDENTITY_ALREADY_LINKED'),/tài khoản KanbanGit hiện tại/);
 assert.match(m('invalid_state'),/hết hạn hoặc không khớp/);
 assert.match(m('ACCOUNT_EMAIL_VERIFICATION_REQUIRED'),/bắt đầu lại/);
 assert.equal(m(null),null);
});
test('local project creation never uses GitHub endpoint or sends GitHub visibility',async()=>{
 const calls=[];const {repositoryService:s}=load('src/services/repository.service.ts',{'./http':{http:{post:async(...args)=>{calls.push(args);return{};}}}});
 await s.create({name:'Local',description:'Work',providerType:'KANBANGIT',visibility:'PRIVATE'});
 await s.create({name:'Repo',providerType:'GITHUB',visibility:'PUBLIC'});
 assert.deepEqual(calls,[['/projects',{name:'Local',description:'Work'}],['/github/projects',{name:'Repo',description:undefined,visibility:'PUBLIC'}]]);
});
test('identity unlink refreshes account and reports errors instead of claiming success',async()=>{
 let fail=true;const identityService={unlink:async()=>{if(fail)throw Error('Last provider');},list:async()=>[{provider:'GOOGLE'}]};
 const {useIdentitiesStore:store}=load('src/stores/identities.store.ts',{'@/services/identity.service':{identityService},'@/services/auth.service':{authService:{getMe:async()=>({id:'u',identities:[{provider:'GOOGLE'}]})}},'@/utils':{getErrorMessage:e=>e.message}});
 await assert.rejects(store.getState().unlink('GOOGLE'),/Last provider/);assert.equal(store.getState().loading,false);assert.equal(store.getState().error,'Last provider');
 fail=false;const user=await store.getState().unlink('GITHUB');assert.equal(user.id,'u');assert.equal(store.getState().data[0].provider,'GOOGLE');
});
test('linked account URLs and unlink use authenticated shared HTTP endpoints',async()=>{
 const calls=[];const http={get:async(...a)=>calls.push(['get',...a]),post:async(...a)=>calls.push(['post',...a]),delete:async(...a)=>calls.push(['delete',...a])};
 const {identityService:s}=load('src/services/identity.service.ts',{'./http':{http}});await s.list();await s.link('GOOGLE');await s.unlink('GITHUB');
 assert.deepEqual(calls,[['get','/users/me/identities'],['post','/users/me/identities/GOOGLE/link'],['delete','/users/me/identities/GITHUB']]);
});
