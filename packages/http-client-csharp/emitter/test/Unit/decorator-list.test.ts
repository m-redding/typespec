vi.resetModules();

import { TestHost } from "@typespec/compiler/testing";
import { deepStrictEqual, strictEqual } from "assert";
import { ok } from "assert/strict";
import { beforeEach, describe, it, vi } from "vitest";
import { createModel } from "../../src/lib/client-model-builder.js";
import {
  createCSharpSdkContext,
  createEmitterContext,
  createEmitterTestHost,
  typeSpecCompile,
} from "./utils/test-util.js";

describe("Test emitting decorator list", () => {
  let runner: TestHost;

  beforeEach(async () => {
    runner = await createEmitterTestHost();
  });

  it("emit decorator list on a client", async () => {
    const program = await typeSpecCompile(
      `
      @clientName("CsharpBookClient")
      interface BookClient {
        op test(): void;
      }
      `,
      runner,
      { IsTCGCNeeded: true, IsXmlNeeded: true },
    );
    const context = createEmitterContext(program);
    const sdkContext = await createCSharpSdkContext(context, {
      additionalDecorators: ["Azure\\.ClientGenerator\\.Core\\.@clientName"],
    });
    const root = createModel(sdkContext);
    const clients = root.clients;
    strictEqual(clients.length, 1);
    ok(clients[0].children);
    strictEqual(clients[0].children.length, 1);
    const childClient = clients[0].children[0];
    deepStrictEqual(childClient.decorators, [
      {
        name: "Azure.ClientGenerator.Core.@clientName",
        arguments: {
          rename: "CsharpBookClient",
        },
      },
    ]);
  });

  it("emit decorator list on a operation", async () => {
    const program = await typeSpecCompile(
      `
      model Book {
        content: string;
      }
      @clientName("ClientTestOperation")
      op test(): Book;
      `,
      runner,
      { IsTCGCNeeded: true, IsXmlNeeded: true },
    );
    const context = createEmitterContext(program);
    const sdkContext = await createCSharpSdkContext(context, {
      additionalDecorators: ["Azure\\.ClientGenerator\\.Core\\.@clientName"],
    });
    const root = createModel(sdkContext);
    const operations = root.clients[0].operations;
    strictEqual(operations.length, 1);
    deepStrictEqual(operations[0].decorators, [
      {
        name: "Azure.ClientGenerator.Core.@clientName",
        arguments: {
          rename: "ClientTestOperation",
        },
      },
    ]);
  });

  it("emit decorator list on a model", async () => {
    const program = await typeSpecCompile(
      `
      @clientName("ClientBook")
      model Book {
        content: string;
      }

      op test(): Book;
      `,
      runner,
      { IsTCGCNeeded: true, IsXmlNeeded: true },
    );
    const context = createEmitterContext(program);
    const sdkContext = await createCSharpSdkContext(context, {
      additionalDecorators: ["Azure\\.ClientGenerator\\.Core\\.@clientName"],
    });
    const root = createModel(sdkContext);
    const models = root.models;
    strictEqual(models.length, 1);
    deepStrictEqual(models[0].decorators, [
      {
        name: "Azure.ClientGenerator.Core.@clientName",
        arguments: {
          rename: "ClientBook",
        },
      },
    ]);
  });

  it("emit decorator list on a model property", async () => {
    const program = await typeSpecCompile(
      `
      model Book {
        @clientName("ClientContent")
        content: string;
      }

      op test(): Book;
      `,
      runner,
      { IsTCGCNeeded: true, IsXmlNeeded: true },
    );
    const context = createEmitterContext(program);
    const sdkContext = await createCSharpSdkContext(context, {
      additionalDecorators: ["Azure\\.ClientGenerator\\.Core\\.@clientName"],
    });
    const root = createModel(sdkContext);
    const models = root.models;
    strictEqual(models.length, 1);
    deepStrictEqual(models[0].properties[0].decorators, [
      {
        name: "Azure.ClientGenerator.Core.@clientName",
        arguments: {
          rename: "ClientContent",
        },
      },
    ]);
  });

  it("emit decorator list on a parameter", async () => {
    const program = await typeSpecCompile(
      `
      @clientName("ClientTestOperation")
      op test(@clientName("ClientId") @header id: string): void;
      `,
      runner,
      { IsTCGCNeeded: true, IsXmlNeeded: true },
    );
    const context = createEmitterContext(program);
    const sdkContext = await createCSharpSdkContext(context, {
      additionalDecorators: ["Azure\\.ClientGenerator\\.Core\\.@clientName"],
    });
    const root = createModel(sdkContext);
    const operations = root.clients[0].operations;
    strictEqual(operations.length, 1);
    const idParameters = operations[0].parameters.filter((p) => p.name === "ClientId");
    strictEqual(idParameters.length, 1);
    deepStrictEqual(idParameters[0].decorators, [
      {
        name: "Azure.ClientGenerator.Core.@clientName",
        arguments: {
          rename: "ClientId",
        },
      },
    ]);
  });
});
