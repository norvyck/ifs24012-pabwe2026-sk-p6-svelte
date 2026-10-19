import { describe, it, expect, vi, beforeEach } from "vitest";
import linkTreesStore, { useLinkTreesStore } from "./linkTreesStore";
import linkTreeApi from "../api/linkTreeApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("linkTreesStore", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    linkTreesStore.reset();
  });

  it("should have correct initial state and getters", () => {
    expect(linkTreesStore.linkTrees).toEqual([]);
    expect(linkTreesStore.linkTree).toBeNull();
    expect(linkTreesStore.isLinkTree).toBe(false);
    expect(linkTreesStore.isLinkTreeAdd).toBe(false);
    expect(linkTreesStore.isLinkTreeAdded).toBe(false);
    expect(linkTreesStore.isLinkTreeChange).toBe(false);
    expect(linkTreesStore.isLinkTreeChanged).toBe(false);
    expect(linkTreesStore.isLinkTreeChangeCover).toBe(false);
    expect(linkTreesStore.isLinkTreeChangedCover).toBe(false);
    expect(linkTreesStore.isLinkTreeDelete).toBe(false);
    expect(linkTreesStore.isLinkTreeDeleted).toBe(false);
    expect(linkTreesStore.isLinkTreeDeleteAll).toBe(false);
    expect(linkTreesStore.isLinkTreeDeletedAll).toBe(false);
    expect(linkTreesStore.isItemAdd).toBe(false);
    expect(linkTreesStore.isItemAdded).toBe(false);
    expect(linkTreesStore.isItemChange).toBe(false);
    expect(linkTreesStore.isItemChanged).toBe(false);
    expect(linkTreesStore.isItemDelete).toBe(false);
    expect(linkTreesStore.isItemDeleted).toBe(false);
    expect(linkTreesStore.$state).toBeDefined();
    expect(useLinkTreesStore()).toBe(linkTreesStore);
  });

  it("should update state with setters", () => {
    linkTreesStore.setLinkTrees([{ id: 1 }]);
    expect(linkTreesStore.linkTrees).toEqual([{ id: 1 }]);

    linkTreesStore.setLinkTree({ id: 2 });
    expect(linkTreesStore.linkTree).toEqual({ id: 2 });

    linkTreesStore.setIsLinkTree(true);
    expect(linkTreesStore.isLinkTree).toBe(true);

    linkTreesStore.setIsLinkTreeAdd(true);
    expect(linkTreesStore.isLinkTreeAdd).toBe(true);

    linkTreesStore.setIsLinkTreeAdded(true);
    expect(linkTreesStore.isLinkTreeAdded).toBe(true);

    linkTreesStore.setIsLinkTreeChange(true);
    expect(linkTreesStore.isLinkTreeChange).toBe(true);

    linkTreesStore.setIsLinkTreeChanged(true);
    expect(linkTreesStore.isLinkTreeChanged).toBe(true);

    linkTreesStore.setIsLinkTreeChangeCover(true);
    expect(linkTreesStore.isLinkTreeChangeCover).toBe(true);

    linkTreesStore.setIsLinkTreeChangedCover(true);
    expect(linkTreesStore.isLinkTreeChangedCover).toBe(true);

    linkTreesStore.setIsLinkTreeDelete(true);
    expect(linkTreesStore.isLinkTreeDelete).toBe(true);

    linkTreesStore.setIsLinkTreeDeleted(true);
    expect(linkTreesStore.isLinkTreeDeleted).toBe(true);

    linkTreesStore.setIsLinkTreeDeleteAll(true);
    expect(linkTreesStore.isLinkTreeDeleteAll).toBe(true);

    linkTreesStore.setIsLinkTreeDeletedAll(true);
    expect(linkTreesStore.isLinkTreeDeletedAll).toBe(true);

    linkTreesStore.setIsItemAdd(true);
    expect(linkTreesStore.isItemAdd).toBe(true);

    linkTreesStore.setIsItemAdded(true);
    expect(linkTreesStore.isItemAdded).toBe(true);

    linkTreesStore.setIsItemChange(true);
    expect(linkTreesStore.isItemChange).toBe(true);

    linkTreesStore.setIsItemChanged(true);
    expect(linkTreesStore.isItemChanged).toBe(true);

    linkTreesStore.setIsItemDelete(true);
    expect(linkTreesStore.isItemDelete).toBe(true);

    linkTreesStore.setIsItemDeleted(true);
    expect(linkTreesStore.isItemDeleted).toBe(true);
  });

  describe("asyncSetLinkTrees", () => {
    it("should set link trees on success", async () => {
      const mockTrees = [{ id: 1, title: "LT 1" }];
      vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue(mockTrees);

      await linkTreesStore.asyncSetLinkTrees();
      expect(linkTreesStore.linkTrees).toEqual(mockTrees);
    });

    it("should set empty array on error", async () => {
      vi.spyOn(linkTreeApi, "getLinkTrees").mockRejectedValue(new Error("Network Error"));

      await linkTreesStore.asyncSetLinkTrees();
      expect(linkTreesStore.linkTrees).toEqual([]);
    });
  });

  describe("asyncSetLinkTree", () => {
    it("should set single link tree on success", async () => {
      const mockTree = { id: 1, title: "Detail LT" };
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockTree);

      await linkTreesStore.asyncSetLinkTree(1);
      expect(linkTreesStore.linkTree).toEqual(mockTree);
      expect(linkTreesStore.isLinkTree).toBe(true);
    });

    it("should set linkTree to null on error", async () => {
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("Not Found"));

      await linkTreesStore.asyncSetLinkTree(99);
      expect(linkTreesStore.linkTree).toBeNull();
      expect(linkTreesStore.isLinkTree).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeAdd", () => {
    it("should handle success", async () => {
      vi.spyOn(linkTreeApi, "postLinkTree").mockResolvedValue({ id: 10 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeAdd("New LT", "public", "Desc");
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil ditambahkan!");
      expect(linkTreesStore.isLinkTreeAdded).toBe(true);
      expect(linkTreesStore.isLinkTreeAdd).toBe(true);
    });

    it("should handle error", async () => {
      vi.spyOn(linkTreeApi, "postLinkTree").mockRejectedValue(new Error("Fail Add"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeAdd("", "public", "");
      expect(errorSpy).toHaveBeenCalledWith("Fail Add");
      expect(linkTreesStore.isLinkTreeAdded).toBe(false);
      expect(linkTreesStore.isLinkTreeAdd).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeChange", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue("Berhasil diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeChange(1, "Updated", "private", "Desc");
      expect(successSpy).toHaveBeenCalledWith("Berhasil diubah");
      expect(linkTreesStore.isLinkTreeChanged).toBe(true);
      expect(linkTreesStore.isLinkTreeChange).toBe(true);
    });

    it("should handle success with fallback message", async () => {
      vi.spyOn(linkTreeApi, "putLinkTree").mockResolvedValue(null);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeChange(1, "Updated", "private", "Desc");
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil diperbarui!");
      expect(linkTreesStore.isLinkTreeChanged).toBe(true);
      expect(linkTreesStore.isLinkTreeChange).toBe(true);
    });

    it("should handle error", async () => {
      vi.spyOn(linkTreeApi, "putLinkTree").mockRejectedValue(new Error("Fail Update"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeChange(1, "", "private", "");
      expect(errorSpy).toHaveBeenCalledWith("Fail Update");
      expect(linkTreesStore.isLinkTreeChanged).toBe(false);
      expect(linkTreesStore.isLinkTreeChange).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeChangeCover", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue("Cover diupdate");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new Blob());
      expect(successSpy).toHaveBeenCalledWith("Cover diupdate");
      expect(linkTreesStore.isLinkTreeChangedCover).toBe(true);
      expect(linkTreesStore.isLinkTreeChangeCover).toBe(true);
    });

    it("should handle success with fallback message", async () => {
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockResolvedValue(null);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new Blob());
      expect(successSpy).toHaveBeenCalledWith("Cover berhasil diperbarui!");
      expect(linkTreesStore.isLinkTreeChangedCover).toBe(true);
      expect(linkTreesStore.isLinkTreeChangeCover).toBe(true);
    });

    it("should handle error", async () => {
      vi.spyOn(linkTreeApi, "postLinkTreeCover").mockRejectedValue(new Error("Fail Cover"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeChangeCover(1, new Blob());
      expect(errorSpy).toHaveBeenCalledWith("Fail Cover");
      expect(linkTreesStore.isLinkTreeChangedCover).toBe(false);
      expect(linkTreesStore.isLinkTreeChangeCover).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeDelete", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue("Dihapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Dihapus");
      expect(linkTreesStore.isLinkTreeDeleted).toBe(true);
      expect(linkTreesStore.isLinkTreeDelete).toBe(true);
    });

    it("should handle success with fallback message", async () => {
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockResolvedValue(null);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeDelete(1);
      expect(successSpy).toHaveBeenCalledWith("Link tree berhasil dihapus!");
      expect(linkTreesStore.isLinkTreeDeleted).toBe(true);
      expect(linkTreesStore.isLinkTreeDelete).toBe(true);
    });

    it("should handle error", async () => {
      vi.spyOn(linkTreeApi, "deleteLinkTree").mockRejectedValue(new Error("Fail Delete"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeDelete(1);
      expect(errorSpy).toHaveBeenCalledWith("Fail Delete");
      expect(linkTreesStore.isLinkTreeDeleted).toBe(false);
      expect(linkTreesStore.isLinkTreeDelete).toBe(true);
    });
  });

  describe("asyncSetIsLinkTreeDeleteAll", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue("Semua dihapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
      expect(successSpy).toHaveBeenCalledWith("Semua dihapus");
      expect(linkTreesStore.isLinkTreeDeletedAll).toBe(true);
      expect(linkTreesStore.isLinkTreeDeleteAll).toBe(true);
    });

    it("should handle success with fallback message", async () => {
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockResolvedValue(null);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
      expect(successSpy).toHaveBeenCalledWith("Semua link tree berhasil dihapus!");
      expect(linkTreesStore.isLinkTreeDeletedAll).toBe(true);
      expect(linkTreesStore.isLinkTreeDeleteAll).toBe(true);
    });

    it("should handle error", async () => {
      vi.spyOn(linkTreeApi, "deleteAllLinkTrees").mockRejectedValue(new Error("Fail Delete All"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsLinkTreeDeleteAll();
      expect(errorSpy).toHaveBeenCalledWith("Fail Delete All");
      expect(linkTreesStore.isLinkTreeDeletedAll).toBe(false);
      expect(linkTreesStore.isLinkTreeDeleteAll).toBe(true);
    });
  });

  describe("asyncSetIsItemAdd", () => {
    it("should handle success", async () => {
      vi.spyOn(linkTreeApi, "postLinkTreeItem").mockResolvedValue({ id: 20 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsItemAdd(1, "Item", "https://url.com");
      expect(successSpy).toHaveBeenCalledWith("Item berhasil ditambahkan!");
      expect(linkTreesStore.isItemAdded).toBe(true);
      expect(linkTreesStore.isItemAdd).toBe(true);
    });

    it("should handle error", async () => {
      vi.spyOn(linkTreeApi, "postLinkTreeItem").mockRejectedValue(new Error("Fail Add Item"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsItemAdd(1, "", "");
      expect(errorSpy).toHaveBeenCalledWith("Fail Add Item");
      expect(linkTreesStore.isItemAdded).toBe(false);
      expect(linkTreesStore.isItemAdd).toBe(true);
    });
  });

  describe("asyncSetIsItemChange", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(linkTreeApi, "putLinkTreeItem").mockResolvedValue("Item diperbarui");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsItemChange(1, 10, "Item Updated", "https://url.com");
      expect(successSpy).toHaveBeenCalledWith("Item diperbarui");
      expect(linkTreesStore.isItemChanged).toBe(true);
      expect(linkTreesStore.isItemChange).toBe(true);
    });

    it("should handle success with fallback message", async () => {
      vi.spyOn(linkTreeApi, "putLinkTreeItem").mockResolvedValue(null);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsItemChange(1, 10, "Item Updated", "https://url.com");
      expect(successSpy).toHaveBeenCalledWith("Item berhasil diperbarui!");
      expect(linkTreesStore.isItemChanged).toBe(true);
      expect(linkTreesStore.isItemChange).toBe(true);
    });

    it("should handle error", async () => {
      vi.spyOn(linkTreeApi, "putLinkTreeItem").mockRejectedValue(new Error("Fail Update Item"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsItemChange(1, 10, "", "");
      expect(errorSpy).toHaveBeenCalledWith("Fail Update Item");
      expect(linkTreesStore.isItemChanged).toBe(false);
      expect(linkTreesStore.isItemChange).toBe(true);
    });
  });

  describe("asyncSetIsItemDelete", () => {
    it("should handle success with custom message", async () => {
      vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockResolvedValue("Item terhapus");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsItemDelete(1, 10);
      expect(successSpy).toHaveBeenCalledWith("Item terhapus");
      expect(linkTreesStore.isItemDeleted).toBe(true);
      expect(linkTreesStore.isItemDelete).toBe(true);
    });

    it("should handle success with fallback message", async () => {
      vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockResolvedValue(null);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsItemDelete(1, 10);
      expect(successSpy).toHaveBeenCalledWith("Item berhasil dihapus!");
      expect(linkTreesStore.isItemDeleted).toBe(true);
      expect(linkTreesStore.isItemDelete).toBe(true);
    });

    it("should handle error", async () => {
      vi.spyOn(linkTreeApi, "deleteLinkTreeItem").mockRejectedValue(new Error("Fail Delete Item"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

      await linkTreesStore.asyncSetIsItemDelete(1, 10);
      expect(errorSpy).toHaveBeenCalledWith("Fail Delete Item");
      expect(linkTreesStore.isItemDeleted).toBe(false);
      expect(linkTreesStore.isItemDelete).toBe(true);
    });
  });
});
