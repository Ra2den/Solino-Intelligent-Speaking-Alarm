import pytest
import asyncio
from unittest.mock import AsyncMock

from domain.assistant.schemas import AiState
from domain.assistant.state_manager import update_ai_state, current_ai_status, active_status_connections

@pytest.mark.asyncio
async def test_update_ai_state():
    # Setup mock connections
    mock_connection_1 = AsyncMock()
    mock_connection_2 = AsyncMock()
    
    active_status_connections.clear()
    active_status_connections.append(mock_connection_1)
    active_status_connections.append(mock_connection_2)
    
    # Run the function to test
    await update_ai_state(AiState.LISTENING)
    
    # Check the global state updated
    assert current_ai_status["state"] == AiState.LISTENING.value
    
    # Check that both connections received the message
    mock_connection_1.send_text.assert_called_once()
    mock_connection_2.send_text.assert_called_once()
    
    # Check that the sent message was correct
    sent_json = mock_connection_1.send_text.call_args[0][0]
    assert '"state":"LISTENING"' in sent_json
