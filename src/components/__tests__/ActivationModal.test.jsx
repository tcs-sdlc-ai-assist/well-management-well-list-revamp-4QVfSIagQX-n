import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivationModal from '../ActivationModal.jsx';

describe('ActivationModal', () => {
  const defaultWell = {
    id: 'well-001',
    rig: 'Rig Alpha',
    wellName: 'Alpha Well 1',
    wellId: 'AW-001',
  };

  const currentActiveWell = {
    id: 'well-002',
    wellId: 'AW-002',
    wellName: 'Alpha Well 2',
  };

  let onConfirm;
  let onCancel;

  beforeEach(() => {
    onConfirm = vi.fn();
    onCancel = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering when closed', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={false}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(container.innerHTML).toBe('');
    });

    it('renders nothing when well is null', () => {
      const { container } = render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={null}
        />
      );

      expect(container.innerHTML).toBe('');
    });
  });

  describe('rendering with no current active well', () => {
    it('renders the modal with Confirm Activation title', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText('Confirm Activation')).toBeInTheDocument();
    });

    it('displays the target well name in the green info box', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText('Alpha Well 1')).toBeInTheDocument();
    });

    it('displays the target well ID', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText('Well ID: AW-001')).toBeInTheDocument();
    });

    it('displays "Will be activated" label', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText('Will be activated')).toBeInTheDocument();
    });

    it('displays message that no well is currently active on the rig', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText('No well is currently active on this rig.')).toBeInTheDocument();
    });

    it('does not display "Will be deactivated" label', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.queryByText('Will be deactivated')).not.toBeInTheDocument();
    });

    it('displays the rig name in the confirmation message', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText('Rig Alpha')).toBeInTheDocument();
    });

    it('renders Cancel and Confirm Activation buttons', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm activation/i })).toBeInTheDocument();
    });
  });

  describe('rendering with existing active well on same rig', () => {
    it('displays "Will be activated" label for the new well', () => {
      render(
        <ActivationModal
          currentActiveWell={currentActiveWell}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText('Will be activated')).toBeInTheDocument();
    });

    it('displays "Will be deactivated" label for the current active well', () => {
      render(
        <ActivationModal
          currentActiveWell={currentActiveWell}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText('Will be deactivated')).toBeInTheDocument();
    });

    it('displays the new well info in the green box', () => {
      render(
        <ActivationModal
          currentActiveWell={currentActiveWell}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText('Alpha Well 1')).toBeInTheDocument();
      expect(screen.getByText('Well ID: AW-001')).toBeInTheDocument();
    });

    it('displays the current active well info in the red box', () => {
      render(
        <ActivationModal
          currentActiveWell={currentActiveWell}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText('Alpha Well 2')).toBeInTheDocument();
      expect(screen.getByText('Well ID: AW-002')).toBeInTheDocument();
    });

    it('displays deactivation warning message with rig name', () => {
      render(
        <ActivationModal
          currentActiveWell={currentActiveWell}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText('Rig Alpha')).toBeInTheDocument();
    });

    it('does not display "No well is currently active" message', () => {
      render(
        <ActivationModal
          currentActiveWell={currentActiveWell}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.queryByText('No well is currently active on this rig.')).not.toBeInTheDocument();
    });
  });

  describe('confirm action', () => {
    it('calls onConfirm when Confirm Activation button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /confirm activation/i });
      await user.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when there is a current active well and confirm is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          currentActiveWell={currentActiveWell}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /confirm activation/i });
      await user.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel action', () => {
    it('calls onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when close (X) button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Escape key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      await user.keyboard('{Escape}');

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when clicking the overlay background', async () => {
      const user = userEvent.setup();

      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      const overlay = screen.getByRole('dialog').parentElement || screen.getByRole('dialog');
      // Click on the overlay (the outermost div with the backdrop)
      const backdropEl = screen.getByRole('dialog');
      await user.click(backdropEl);

      // The overlay click handler checks if the click target is outside the modal ref
      // Clicking on the dialog itself (the overlay) should trigger onCancel
      // since the modal content is inside a child div
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has role="dialog" on the modal overlay', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal="true" on the dialog', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby pointing to the modal title', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'activation-modal-title');

      const title = document.getElementById('activation-modal-title');
      expect(title).toBeInTheDocument();
      expect(title.textContent).toBe('Confirm Activation');
    });

    it('renders close button with aria-label', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });
  });

  describe('correct messaging', () => {
    it('shows activation question when no active well exists on rig', () => {
      render(
        <ActivationModal
          currentActiveWell={null}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText(/are you sure you want to activate/i)).toBeInTheDocument();
    });

    it('shows replacement message when active well exists on rig', () => {
      render(
        <ActivationModal
          currentActiveWell={currentActiveWell}
          isOpen={true}
          onCancel={onCancel}
          onConfirm={onConfirm}
          well={defaultWell}
        />
      );

      expect(screen.getByText(/activating this well will deactivate/i)).toBeInTheDocument();
    });
  });
});