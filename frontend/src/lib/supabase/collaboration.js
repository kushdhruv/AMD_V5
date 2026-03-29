import { supabase } from './supabase-client';

/**
 * INVITE A COLLABORATOR
 * @param {string} email - Receivers email
 * @param {string} entityId - UUID of the project/video/image
 * @param {string} entityType - 'project' | 'video' | 'image' | 'app'
 */
export async function inviteCollaborator(email, entityId, entityType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Create the invite
  const { data, error } = await supabase
    .from('collaboration_invites')
    .insert({
      inviter_id: user.id,
      invitee_email: email,
      entity_id: entityId,
      entity_type: entityType,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * GET PENDING INVITES FOR CURRENT USER
 */
export async function getPendingInvites() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('collaboration_invites')
    .select(`
        *,
        inviter:profiles!inviter_id(email, display_name)
    `)
    .eq('invitee_email', user.email)
    .eq('status', 'pending');

  if (error) throw error;
  return data;
}

/**
 * ACCEPT AN INVITE
 */
export async function acceptInvite(inviteId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1. Get invite details
  const { data: invite, error: inviteError } = await supabase
    .from('collaboration_invites')
    .select('*')
    .eq('id', inviteId)
    .single();

  if (inviteError) throw inviteError;

  // 2. Create collaborator record
  const { error: collabError } = await supabase
    .from('collaborators')
    .insert({
      user_id: user.id,
      entity_id: invite.entity_id,
      entity_type: invite.entity_type,
      role: 'editor'
    });

  if (collabError) throw collabError;

  // 3. Delete the invite
  await supabase.from('collaboration_invites').delete().eq('id', inviteId);

  return true;
}

/**
 * DECLINE AN INVITE
 */
export async function declineInvite(inviteId) {
  const { error } = await supabase
    .from('collaboration_invites')
    .delete()
    .eq('id', inviteId);

  if (error) throw error;
  return true;
}

/**
 * TOGGLE PUBLIC VISIBILITY
 */
export async function toggleVisibility(entityId, entityType, isPublic) {
  const tableMap = {
    project: 'projects',
    video: 'generated_videos',
    image: 'generated_images',
    app: 'app_builder_projects'
  };

  const table = tableMap[entityType];
  if (!table) throw new Error("Invalid entity type");

  const { error } = await supabase
    .from(table)
    .update({ is_public: isPublic })
    .eq('id', entityId);

  if (error) throw error;
  return true;
}

/**
 * GET COLLABORATED ITEMS
 * Fetches IDs of items where user is a collaborator
 */
export async function getCollaboratedItems(entityType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('collaborators')
    .select('entity_id')
    .eq('user_id', user.id)
    .eq('entity_type', entityType);

  if (error) throw error;
  return data.map(d => d.entity_id);
}
