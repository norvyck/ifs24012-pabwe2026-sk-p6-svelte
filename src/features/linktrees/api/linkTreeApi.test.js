import { describe, it, expect, vi, beforeEach } from "vitest";
import linkTreeApi from "./linkTreeApi";
import apiHelper from "../../../helpers/apiHelper";

describe("linkTreeApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postLinkTree", () => {
    it("should create new link tree and return data", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { link_tree_id: 10 },
        }),
      });

      const res = await linkTreeApi.postLinkTree("Title", "public", "Description");
      expect(res).toEqual({ link_tree_id: 10 });
    });

    it("should throw error if creation fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
        }),
      });

      await expect(linkTreeApi.postLinkTree("", "public", "")).rejects.toThrow("Data tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.postLinkTree("", "public", "")).rejects.toThrow("Gagal menambahkan link tree");
    });
  });

  describe("postLinkTreeCover", () => {
    it("should upload cover with FormData and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah cover",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
      const msg = await linkTreeApi.postLinkTreeCover(1, dummyFile);
      expect(msg).toBe("Berhasil mengubah cover");
    });

    it("should handle cover file without name property properly", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil",
        }),
      });

      const dummyBlob = new Blob(["dummy"], { type: "image/jpeg" });
      const msg = await linkTreeApi.postLinkTreeCover(1, dummyBlob);
      expect(msg).toBe("Berhasil");
    });

    it("should throw error on upload cover fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Format tidak didukung",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg");
      await expect(linkTreeApi.postLinkTreeCover(1, dummyFile)).rejects.toThrow(
        "Format tidak didukung"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      const dummyFile = new File(["dummy"], "cover.jpg");
      await expect(linkTreeApi.postLinkTreeCover(1, dummyFile)).rejects.toThrow(
        "Gagal mengubah cover"
      );
    });
  });

  describe("putLinkTree", () => {
    it("should update link tree and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah data",
        }),
      });

      const msg = await linkTreeApi.putLinkTree(1, "Updated", "private", "Desc");
      expect(msg).toBe("Berhasil mengubah data");
    });

    it("should throw error on update failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal update link tree",
        }),
      });

      await expect(linkTreeApi.putLinkTree(1, "", "public", "")).rejects.toThrow("Gagal update link tree");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.putLinkTree(1, "", "public", "")).rejects.toThrow("Gagal mengubah link tree");
    });
  });

  describe("getLinkTrees", () => {
    it("should fetch all link trees without filter", async () => {
      const mockTrees = [{ id: 1, title: "Tree 1" }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { link_trees: mockTrees },
        }),
      });

      const trees = await linkTreeApi.getLinkTrees();
      expect(trees).toEqual(mockTrees);
    });

    it("should fetch filtered link trees when is_my_link_trees parameter provided", async () => {
      const mockTrees = [{ id: 2, title: "Tree 2" }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { link_trees: mockTrees },
        }),
      });

      const trees = await linkTreeApi.getLinkTrees("1");
      expect(trees).toEqual(mockTrees);
    });

    it("should return empty array if data.link_trees is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: {},
        }),
      });

      const trees = await linkTreeApi.getLinkTrees();
      expect(trees).toEqual([]);
    });

    it("should throw error on fetch link trees fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Akses tidak diizinkan",
        }),
      });

      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow("Akses tidak diizinkan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow("Gagal mengambil data link tree");
    });
  });

  describe("getLinkTreeById", () => {
    it("should return single link tree object on success", async () => {
      const mockTree = { id: 5, title: "Single Tree", items: [] };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { link_tree: mockTree },
        }),
      });

      const res = await linkTreeApi.getLinkTreeById(5);
      expect(res).toEqual(mockTree);
    });

    it("should throw error on detail fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Link tree tidak ditemukan",
        }),
      });

      await expect(linkTreeApi.getLinkTreeById(999)).rejects.toThrow("Link tree tidak ditemukan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.getLinkTreeById(999)).rejects.toThrow("Gagal mengambil detail link tree");
    });
  });

  describe("deleteLinkTree", () => {
    it("should delete link tree and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus data",
        }),
      });

      const msg = await linkTreeApi.deleteLinkTree(1);
      expect(msg).toBe("Berhasil menghapus data");
    });

    it("should throw error on delete fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal menghapus",
        }),
      });

      await expect(linkTreeApi.deleteLinkTree(1)).rejects.toThrow("Gagal menghapus");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.deleteLinkTree(1)).rejects.toThrow("Gagal menghapus link tree");
    });
  });

  describe("deleteAllLinkTrees", () => {
    it("should delete all link trees and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil menghapus semua data",
        }),
      });

      const msg = await linkTreeApi.deleteAllLinkTrees();
      expect(msg).toBe("Berhasil menghapus semua data");
    });

    it("should throw error on delete all fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal menghapus semua",
        }),
      });

      await expect(linkTreeApi.deleteAllLinkTrees()).rejects.toThrow("Gagal menghapus semua");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.deleteAllLinkTrees()).rejects.toThrow("Gagal menghapus semua link tree");
    });
  });

  describe("postLinkTreeItem", () => {
    it("should add an item to link tree and return data", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { item_id: 101 },
        }),
      });

      const res = await linkTreeApi.postLinkTreeItem(1, "My Github", "https://github.com");
      expect(res).toEqual({ item_id: 101 });
    });

    it("should throw error if adding item fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "URL tidak valid",
        }),
      });

      await expect(linkTreeApi.postLinkTreeItem(1, "Test", "invalid")).rejects.toThrow("URL tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.postLinkTreeItem(1, "Test", "invalid")).rejects.toThrow("Gagal menambahkan item link tree");
    });
  });

  describe("putLinkTreeItem", () => {
    it("should update item and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Item berhasil diperbarui",
        }),
      });

      const msg = await linkTreeApi.putLinkTreeItem(1, 101, "Updated Title", "https://github.com/updated");
      expect(msg).toBe("Item berhasil diperbarui");
    });

    it("should throw error if updating item fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal memperbarui item",
        }),
      });

      await expect(linkTreeApi.putLinkTreeItem(1, 101, "Test", "url")).rejects.toThrow("Gagal memperbarui item");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.putLinkTreeItem(1, 101, "Test", "url")).rejects.toThrow("Gagal mengubah item link tree");
    });
  });

  describe("deleteLinkTreeItem", () => {
    it("should delete item and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Item berhasil dihapus",
        }),
      });

      const msg = await linkTreeApi.deleteLinkTreeItem(1, 101);
      expect(msg).toBe("Item berhasil dihapus");
    });

    it("should throw error if deleting item fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Gagal menghapus item",
        }),
      });

      await expect(linkTreeApi.deleteLinkTreeItem(1, 101)).rejects.toThrow("Gagal menghapus item");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(linkTreeApi.deleteLinkTreeItem(1, 101)).rejects.toThrow("Gagal menghapus item link tree");
    });
  });
});
