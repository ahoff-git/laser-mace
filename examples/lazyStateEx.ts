import { createLazyState } from "../dist/";

interface StateType {
  firstName: string;
  lastName: string;
  fullName: string;
  location: Promise<string>;
  random: number;
}

const state = createLazyState<StateType>({
  firstName: null, // Plain state
  lastName: null, // Plain state
  fullName: ["once", (context) => `${context.firstName} ${context.lastName}`, undefined, ["firstName", "lastName"]], // Computed property
  location: ["timed", async () => {return "Seattle" + Date.now()}, 5000], // Computed property with caching,
  random: ["always", ()=>Math.random()]
});


doStuff();
async function doStuff(){

state.firstName = "John";
state.lastName = "Doe";

console.log(state.fullName); // "John Doe"
console.log(await state.location); // "Seattle"
state.firstName = "Jane";

await outputState(state);

setInterval(()=>outputState(state), 1000);

}

async function outputState(stateObj: StateType){
  console.log(stateObj.fullName);
  console.log(stateObj.random);
  console.log(await stateObj.location);
}