import React, { useState } from "react";
import { useUsersQuery, useChangeUserStatusMutation, useToggleUser2FaMutation } from "../hooks/useUsers";
import type { User } from "../types/users.types";
import { useAuthStore } from "../../auth/auth.store";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import { UserFormDialog } from "../components/UserFormDialog";
import { UserDetailsDialog } from "../components/UserDetailsDialog";
import { UserRoleDialog } from "../components/UserRoleDialog";
import { UserResetPasswordDialog } from "../components/UserResetPasswordDialog";
import { UserDeleteDialog } from "../components/UserDeleteDialog";
import {
  UserCheck,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  ShieldCheck,
  KeyRound,
  Trash2,
  Power,
  Users as UsersIcon,
  CheckCircle,
  XCircle,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const actorRole = currentUser?.role || "OWNER";
  const isOwner = actorRole === "OWNER";

  // App Shell Layout Mobile State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const limit = 10;

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);

  const changeStatusMutation = useChangeUserStatusMutation();
  const toggle2FaMutation = useToggleUser2FaMutation();

  // Query parameters
  const queryFilters = {
    page,
    limit,
    search: search.trim() || undefined,
    role: roleFilter !== "ALL" ? roleFilter : undefined,
    isActive: statusFilter === "ACTIVE" ? true : statusFilter === "INACTIVE" ? false : undefined,
  };

  const { data: usersData, isLoading, isError } = useUsersQuery(queryFilters);

  const users = usersData?.data || [];
  const pagination = usersData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Calculate local KPI counts
  const totalUsersCount = pagination.total;
  const activeCount = users.filter((u) => u.isActive).length;
  const adminOwnerCount = users.filter((u) => u.role === "OWNER" || u.role === "ADMIN").length;
  const inactiveCount = users.filter((u) => !u.isActive).length;

  const startRecord = (pagination.page - 1) * pagination.limit + 1;
  const endRecord = Math.min(pagination.page * pagination.limit, pagination.total);

  const handleToggleStatus = (user: User) => {
    changeStatusMutation.mutate({
      id: user.id,
      isActive: !user.isActive,
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900/40";
      case "ADMIN":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/40";
      case "FINANCE":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40";
      case "SALES":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900/40";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0F17] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab="users"
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#F97316] text-xs font-bold uppercase tracking-wider">
                <UsersIcon className="w-4 h-4" />
                <span>User & RBAC Access Management</span>
                {/* <span className="ml-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#F97316]">
                  {actorRole} Control
                </span> */}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                User Management & Access
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Manage organizational staff, role assignments, security permissions, and active login credentials.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                type="button"
                onClick={() => {
                  setUserToEdit(null);
                  setIsFormOpen(true);
                }}
                className="h-9 px-4 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 text-xs font-bold shadow-sm shadow-orange-500/20 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New User</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Staff Accounts
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                  {totalUsersCount}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center">
                <UsersIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Users
                </span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {activeCount}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Owners & Admins
                </span>
                <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 block">
                  {adminOwnerCount}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Inactive Accounts
                </span>
                <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
                  {inactiveCount}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search Bar & Filters Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search staff by name, email, phone, or department..."
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#182235] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#182235] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                    className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="OWNER">Owner</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SALES">Sales</option>
                    <option value="FINANCE">Finance</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#182235] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                  <span>Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="INACTIVE">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* User Data Table Card */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-[#F97316] border-slate-200 dark:border-slate-800 animate-spin" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Loading users catalog...
                </span>
              </div>
            ) : isError || users.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <UserCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto stroke-1" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No staff accounts found
                </p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Try adjusting search parameters or add a new staff member.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#182235]/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <th className="py-3.5 px-4">User Identity</th>
                      <th className="py-3.5 px-4">Phone / Dept</th>
                      <th className="py-3.5 px-4">RBAC Role</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4">2FA Auth</th>
                      <th className="py-3.5 px-4">Last Activity</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {u.profileImage ? (
                              <img
                                src={u.profileImage}
                                alt={u.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#F97316] font-bold text-xs flex items-center justify-center border border-orange-200 dark:border-orange-900/40">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {u.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Phone / Dept */}
                        <td className="py-3.5 px-4">
                          <span className="text-slate-800 dark:text-slate-200 block font-semibold">
                            {u.phone || "—"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {u.department || "General"}
                          </span>
                        </td>

                        {/* RBAC Role */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getRoleBadge(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              u.isActive
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40"
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/40"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.isActive ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* 2FA Auth */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => toggle2FaMutation.mutate({ id: u.id, twoFactorEnabled: !u.twoFactorEnabled })}
                            title={u.twoFactorEnabled ? "Click to disable 2FA" : "Click to enable 2FA"}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              u.twoFactorEnabled
                                ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/40 hover:bg-purple-100"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            <ShieldCheck className={`w-3 h-3 ${u.twoFactorEnabled ? "text-purple-600 dark:text-purple-400" : "text-slate-400"}`} />
                            <span>{u.twoFactorEnabled ? "2FA Enabled" : "2FA Off"}</span>
                          </button>
                        </td>

                        {/* Last Activity */}
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap font-medium">
                          {u.lastLoginAt ? (
                            new Date(u.lastLoginAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 italic">Never logged in</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="View Details"
                              onClick={() => setSelectedUserForDetails(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              title="Edit User"
                              onClick={() => {
                                setUserToEdit(u);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#F97316] dark:text-slate-400 dark:hover:text-[#F97316] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              title="Change Role"
                              onClick={() => setSelectedUserForRole(u)}
                              className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              title="Reset Password"
                              onClick={() => setSelectedUserForPassword(u)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              title={u.isActive ? "Deactivate User" : "Activate User"}
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded-lg transition-all ${
                                u.isActive
                                  ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                  : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {isOwner && u.id !== currentUser?.id && (
                              <button
                                type="button"
                                title="Delete User"
                                onClick={() => setSelectedUserForDelete(u)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Standard Pagination Component (AGENTS.md Compliant Pattern) */}
            {pagination.total > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left Side */}
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Showing <span className="font-bold text-slate-900 dark:text-white">{startRecord}</span>–<span className="font-bold text-slate-900 dark:text-white">{endRecord}</span> of <span className="font-bold text-slate-900 dark:text-white">{pagination.total}</span>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage(1)}
                    disabled={pagination.page <= 1}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={pagination.page <= 1}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPage(pagination.totalPages)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dialog Modals */}
      <UserFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        userToEdit={userToEdit}
        actorRole={actorRole}
      />

      <UserDetailsDialog
        isOpen={!!selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
        user={selectedUserForDetails}
      />

      <UserRoleDialog
        isOpen={!!selectedUserForRole}
        onClose={() => setSelectedUserForRole(null)}
        user={selectedUserForRole}
        actorRole={actorRole}
      />

      <UserResetPasswordDialog
        isOpen={!!selectedUserForPassword}
        onClose={() => setSelectedUserForPassword(null)}
        user={selectedUserForPassword}
      />

      <UserDeleteDialog
        isOpen={!!selectedUserForDelete}
        onClose={() => setSelectedUserForDelete(null)}
        user={selectedUserForDelete}
      />
    </div>
  );
};
