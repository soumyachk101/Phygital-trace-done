import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import hre from "hardhat";
const { ethers } = hre;
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TruthAttestation", function () {
  let attestation: any;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  const payloadHash = ethers.id("test-payload-1");
  const ipfsCidBytes32 = ethers.encodeBytes32String("QmTest123");

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TruthAttestation");
    attestation = await Factory.deploy();
    await attestation.waitForDeployment();
  });

  describe("Deployment", () => {
    it("sets the deployer as owner", async () => {
      expect(await attestation.owner()).to.equal(owner.address);
    });
  });

  describe("attest()", () => {
    it("allows owner to attest", async () => {
      await attestation.attest(payloadHash, ipfsCidBytes32);
      const result = await attestation.verify(payloadHash);
      expect(result.exists).to.be.true;
      expect(result.attester).to.equal(owner.address);
      expect(result.revoked).to.be.false;
    });

    it("rejects non-owner", async () => {
      await expect(
        attestation.connect(addr1).attest(payloadHash, ipfsCidBytes32)
      ).to.be.reverted;
    });

    it("rejects duplicate attestation", async () => {
      await attestation.attest(payloadHash, ipfsCidBytes32);
      await expect(
        attestation.attest(payloadHash, ipfsCidBytes32)
      ).to.be.revertedWith("Already attested");
    });

    it("rejects zero hash", async () => {
      await expect(
        attestation.attest(ethers.ZeroHash, ipfsCidBytes32)
      ).to.be.revertedWith("Invalid payload hash");
    });

    it("emits Attested event", async () => {
      await expect(attestation.attest(payloadHash, ipfsCidBytes32))
        .to.emit(attestation, "Attested")
        .withArgs(payloadHash, "QmTest123", anyValue, owner.address);
    });
  });

  describe("attestBatch()", () => {
    it("attests multiple payloads", async () => {
      const hashes = [ethers.id("p1"), ethers.id("p2"), ethers.id("p3")];
      const cids = hashes.map((_, i) => ethers.encodeBytes32String(`cid${i}`));
      await attestation.attestBatch(hashes, cids);
      for (const h of hashes) {
        const r = await attestation.verify(h);
        expect(r.exists).to.be.true;
      }
    });

    it("rejects length mismatch", async () => {
      await expect(
        attestation.attestBatch(
          [ethers.id("p1")],
          [ethers.encodeBytes32String("c1"), ethers.encodeBytes32String("c2")]
        )
      ).to.be.revertedWith("Array length mismatch");
    });

    it("skips already attested in batch", async () => {
      const h1 = ethers.id("p1");
      const c1 = ethers.encodeBytes32String("c1");
      await attestation.attest(h1, c1);
      const h2 = ethers.id("p2");
      const c2 = ethers.encodeBytes32String("c2");
      await attestation.attestBatch([h1, h2], [c1, c2]);
      const r2 = await attestation.verify(h2);
      expect(r2.exists).to.be.true;
    });
  });

  describe("verify()", () => {
    it("returns false for unattested payload", async () => {
      const r = await attestation.verify(ethers.id("nonexistent"));
      expect(r.exists).to.be.false;
    });
  });

  describe("revoke()", () => {
    it("allows owner to revoke attestation", async () => {
      await attestation.attest(payloadHash, ipfsCidBytes32);
      await attestation.revoke(payloadHash);
      const r = await attestation.verify(payloadHash);
      expect(r.revoked).to.be.true;
    });

    it("rejects non-owner revoke", async () => {
      await attestation.attest(payloadHash, ipfsCidBytes32);
      await expect(attestation.connect(addr1).revoke(payloadHash)).to.reverted;
    });

    it("rejects revoking non-attested payload", async () => {
      await expect(attestation.revoke(ethers.id("nonexistent"))).to.be.revertedWith("Not attested");
    });

    it("emits Revoked event", async () => {
      await attestation.attest(payloadHash, ipfsCidBytes32);
      await expect(attestation.revoke(payloadHash))
        .to.emit(attestation, "Revoked")
        .withArgs(payloadHash, owner.address, anyValue);
    });
  });

  describe("pause/unpause", () => {
    it("allows owner to pause", async () => {
      await attestation.pause();
      await expect(
        attestation.attest(payloadHash, ipfsCidBytes32)
      ).to.revertedWithCustomError(attestation, "EnforcedPause");
    });

    it("allows owner to unpause after pause", async () => {
      await attestation.pause();
      await attestation.unpause();
      await attestation.attest(payloadHash, ipfsCidBytes32);
      const r = await attestation.verify(payloadHash);
      expect(r.exists).to.be.true;
    });

    it("rejects non-owner pause", async () => {
      await expect(attestation.connect(addr1).pause()).to.reverted;
    });
  });
});
