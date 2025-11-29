import { createFromRoot } from "codama";
import { renderVisitor } from "@codama/renderers-js";
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";
import { readFileSync } from "fs";

const idl = JSON.parse(
  readFileSync("./program/target/idl/panda_battle.json", "utf8")
);
const node = rootNodeFromAnchor(idl);
const visitor = renderVisitor("./lib/sdk/generated");
const codama = createFromRoot(node);

codama.accept(visitor);
