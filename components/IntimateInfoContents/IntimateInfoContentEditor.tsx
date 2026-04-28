import React, { useState, useEffect } from "react";
import {
  useIntimateInfoContent,
  useCreateIntimateInfoContent,
  useUpdateIntimateInfoContent,
  useGenerateHtmlForContent,
  useUploadToWordpress,
  useWordpressCategories,
  useWordpressAuthors,
} from "../../react-query/intimate-info-content";
import { FaArrowLeft, FaRobot, FaUpload, FaSave } from "react-icons/fa";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import Swal from "sweetalert2";

type Props = {
  contentId: string | null;
  onBack: () => void;
};

const IntimateInfoContentEditor = ({ contentId, onBack }: Props) => {
  const isEditing = !!contentId;

  const { data: contentData, isLoading: isLoadingContent } =
    useIntimateInfoContent(contentId || "");

  const { data: categories } = useWordpressCategories();
  const { data: authors } = useWordpressAuthors();

  const createMutation = useCreateIntimateInfoContent();
  const updateMutation = useUpdateIntimateInfoContent();
  const generateHtmlMutation = useGenerateHtmlForContent();
  const uploadToWpMutation = useUploadToWordpress();

  const [formData, setFormData] = useState({
    title: "",
    keyword: "",
    excerpt: "",
    slug: "",
    author: "",
    category: "",
    focusKeyword: "",
    metaTitle: "",
    permalink: "",
    metaDescription: "",
    qaCheck: "",
    html: "",
    status: "unpublish",
  });

  useEffect(() => {
    if (isEditing && contentData) {
      setFormData({
        title: contentData.title || "",
        keyword: contentData.keyword || "",
        excerpt: contentData.excerpt || "",
        slug: contentData.slug || "",
        author: contentData.author || "",
        category: contentData.category || "",
        focusKeyword: contentData.focusKeyword || "",
        metaTitle: contentData.metaTitle || "",
        permalink: contentData.permalink || "",
        metaDescription: contentData.metaDescription || "",
        qaCheck: contentData.qaCheck || "",
        html: contentData.html || "",
        status: contentData.status || "unpublish",
      });
    }
  }, [isEditing, contentData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.title) {
      Swal.fire("Error", "Title is required", "error");
      return;
    }

    try {
      if (isEditing && contentId) {
        await updateMutation.mutateAsync({ id: contentId, ...formData });
        Swal.fire("Success", "Content updated successfully", "success");
      } else {
        const res = await createMutation.mutateAsync(formData);
        Swal.fire("Success", "Content created successfully", "success");
        // We could redirect to edit mode or let the user continue editing
      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to save", "error");
    }
  };

  const handleGenerateHtml = async () => {
    try {
      if (!formData.keyword || !formData.excerpt || !formData.title) {
        Swal.fire(
          "Wait!",
          "Please provide both Keyword and Excerpt for better AI results.",
          "warning",
        );
        return;
      }
      const response = await generateHtmlMutation.mutateAsync({
        title: formData.title,
        keyword: formData.keyword,
        excerpt: formData.excerpt,
      });

      setFormData((prev) => ({ ...prev, html: response }));
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to generate HTML", "error");
    }
  };

  const handlePublish = async () => {
    if (!isEditing || !contentId) return;

    if (!formData.html) {
      Swal.fire(
        "Error",
        "HTML content must be generated before publishing",
        "error",
      );
      return;
    }

    try {
      // First update status to publish
      await updateMutation.mutateAsync({
        id: contentId,
        ...formData,
        status: "publish",
      });

      // Then upload to WP
      await uploadToWpMutation.mutateAsync(contentId);

      setFormData((prev) => ({ ...prev, status: "publish" }));
      Swal.fire("Success", "Uploaded to WordPress successfully!", "success");
    } catch (error: any) {
      Swal.fire("Error", error.message || "Failed to publish", "error");
    }
  };

  const categoryOptions =
    categories?.map((c: any) => ({ label: c.name, value: c.id.toString() })) ||
    [];
  const authorOptions =
    authors?.map((a: any) => ({ label: a.name, value: a.id.toString() })) || [];
  const qaOptions = [
    { label: "Fail", value: "Fail" },
    { label: "Edit Needed", value: "Edit_Needed" },
    { label: "Pass", value: "Pass" },
  ];

  if (isEditing && isLoadingContent) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <FaArrowLeft /> Back
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? "Edit Content" : "Create Content"}
          </h2>
          {isEditing && (
            <span
              className={`ml-2 rounded-full px-3 py-1 text-xs font-semibold ${
                formData.status === "publish"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {formData.status.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <FaSave /> {isEditing ? "Save Changes" : "Create"}
          </button>
          <button
            onClick={handleGenerateHtml}
            disabled={generateHtmlMutation.isPending}
            className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            <FaRobot />{" "}
            {generateHtmlMutation.isPending
              ? "Generating..."
              : "AI Generate HTML"}
          </button>
          {isEditing && (
            <>
              <button
                onClick={handlePublish}
                disabled={uploadToWpMutation.isPending || !formData.html}
                className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                <FaUpload />{" "}
                {uploadToWpMutation.isPending
                  ? "Publishing..."
                  : "Publish to WP"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Preview HTML */}
        <div className="flex-1 overflow-auto border-r bg-white p-6 shadow-inner">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">
            Live Preview
          </h3>
          <div className="min-h-full rounded-md border border-gray-200 bg-gray-50 p-4">
            {formData.html ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.html }}
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-400">
                No HTML generated yet. Fill out the details and click{" "}
                {'"AI Generate HTML"'}.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-[450px] overflow-auto bg-gray-50 p-6">
          <div className="flex flex-col gap-5">
            <h3 className="text-lg font-semibold text-gray-700">
              Content Details
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Title *
              </label>
              <InputText
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter article title"
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Keyword
              </label>
              <InputText
                name="keyword"
                value={formData.keyword}
                onChange={handleChange}
                placeholder="Target keywords for AI"
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Excerpt
              </label>
              <InputTextarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Short summary for WordPress"
                className="w-full rounded border px-3 py-2"
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Slug
              </label>
              <InputText
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="URL slug"
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Category
              </label>
              <Dropdown
                value={formData.category}
                options={categoryOptions}
                onChange={(e) => handleDropdownChange("category", e.value)}
                placeholder="Select a Category"
                className="w-full"
                filter
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Author
              </label>
              <Dropdown
                value={formData.author}
                options={authorOptions}
                onChange={(e) => handleDropdownChange("author", e.value)}
                placeholder="Select an Author"
                className="w-full"
                filter
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-700">
              SEO & Meta
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Focus Keyword
              </label>
              <InputText
                name="focusKeyword"
                value={formData.focusKeyword}
                onChange={handleChange}
                placeholder="SEO focus keyword"
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Meta Title
              </label>
              <InputText
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                placeholder="SEO Meta Title"
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Meta Description
              </label>
              <InputTextarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                placeholder="SEO Meta Description"
                className="w-full rounded border px-3 py-2"
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Permalink
              </label>
              <InputText
                name="permalink"
                value={formData.permalink}
                onChange={handleChange}
                placeholder="Custom Permalink"
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                QA Check
              </label>
              <Dropdown
                value={formData.qaCheck}
                options={qaOptions}
                onChange={(e) => handleDropdownChange("qaCheck", e.value)}
                placeholder="Select QA Status"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntimateInfoContentEditor;
