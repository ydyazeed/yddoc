import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"

// Mock server actions
vi.mock("@/actions/auth", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}))

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}))

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

import { signIn, signUp } from "@/actions/auth"

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders email and password fields", () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it("renders sign in button", () => {
    render(<LoginForm />)
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("renders link to sign up", () => {
    render(<LoginForm />)
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/signup"
    )
  })

  it("calls signIn with form data on submit", async () => {
    vi.mocked(signIn).mockResolvedValueOnce(undefined)
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form")!)

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledOnce()
    })
  })

  it("displays error message on failed sign in", async () => {
    vi.mocked(signIn).mockResolvedValueOnce({ error: "Invalid credentials" })
    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    })
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }).closest("form")!)

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    })
  })
})

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders name, email, and password fields", () => {
    render(<SignupForm />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it("renders create account button", () => {
    render(<SignupForm />)
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument()
  })

  it("renders link to sign in", () => {
    render(<SignupForm />)
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login"
    )
  })

  it("calls signUp with form data on submit", async () => {
    vi.mocked(signUp).mockResolvedValueOnce(undefined)
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "newuser@example.com" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })
    fireEvent.submit(
      screen.getByRole("button", { name: /create account/i }).closest("form")!
    )

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledOnce()
    })
  })

  it("displays error message on failed sign up", async () => {
    vi.mocked(signUp).mockResolvedValueOnce({ error: "Email already in use" })
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "existing@example.com" },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    })
    fireEvent.submit(
      screen.getByRole("button", { name: /create account/i }).closest("form")!
    )

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument()
    })
  })
})
