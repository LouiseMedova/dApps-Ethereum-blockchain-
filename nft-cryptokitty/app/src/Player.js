import React, { useState } from "react";
import { drizzleReactHooks } from "@drizzle/react-plugin";
import { newContextComponents } from "@drizzle/react-components";
import KittyList from "./KittyList";

const { useDrizzle, useDrizzleState } = drizzleReactHooks;
const { ContractForm, ContractData } = newContextComponents;

export default () => {
  const { drizzle } = useDrizzle();
  const state = useDrizzleState(state => state);
  const [ownerOfArg, setOwnerOfArg] = useState(undefined);
  const [balanceOfArg, setBalanceOfArg] = useState(undefined);

  const handleSubmitOwnerOf = e => {
    e.preventDefault();
    setOwnerOfArg(e.target.elements[0].value);
  }

  const handleSubmitBalanceOf= e => {
    e.preventDefault();
    setBalanceOfArg(e.target.elements[0].value);
  }

  return (
    <div>
      <div>
        <h2>Owner Of Kitty</h2>
        <form onSubmit={handleSubmitOwnerOf}>
          <input type="text"></input>
          <button>Submit</button>
        </form>
        {ownerOfArg && (
          <ContractData
            drizzle={drizzle}
            drizzleState={state}
            contract="Cryptokitty"
            method="ownerOf"
            methodArgs={[ownerOfArg]}
          />
        )}
      </div>

      <div>
        <h2>Balance</h2>
        <form onSubmit={handleSubmitBalanceOf}>
          <input type="text"></input>
          <button>Submit</button>
        </form>
        {balanceOfArg && (
          <ContractData
            drizzle={drizzle}
            drizzleState={state}
            contract="Cryptokitty"
            method="balanceOf"
            methodArgs={[balanceOfArg]}
          />
        )}
      </div>

      <div>
        <h2>Breed</h2>
        <ContractForm
          drizzle={drizzle}
          drizzleState={state}
          contract="Cryptokitty"
          method="breed"
        />
      </div>
      <div>
        <h2>Player Kitties</h2>
        <ContractData 
          drizzle={drizzle}
          drizzleState={state}
          contract="Cryptokitty"
          method="tokenURIBase"
          render={uriBase => {
            return (
              <ContractData 
                  drizzle={drizzle}
                  drizzleState={state}
                  contract="Cryptokitty"
                  method="getAllKittiesOf"
                  methodArgs={[state.accounts[0]]}
                  render={kitties =>
                    <KittyList
                      kitties={kitties}
                      uriBase={uriBase}
                      />
                  }
              />
            )
          }}
        />
      </div>
    </div>
  );
};
