import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Card from '../Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello IgranSense</Card>)
    expect(screen.getByText('Hello IgranSense')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<Card title="Test Title">Content</Card>)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('applies clickable role when clickable', () => {
    render(<Card clickable onClick={() => {}}>Click me</Card>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
